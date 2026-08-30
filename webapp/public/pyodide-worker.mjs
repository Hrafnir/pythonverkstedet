const desktopMode = self.location.protocol === "file:";
const localIndex = new URL("./pyodide/", self.location.href).href;
async function localFileUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kunne ikke lese lokal Python-fil: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return `data:application/octet-stream;base64,${btoa(binary)}`;
}
const moduleUrl = desktopMode
  ? `${localIndex}pyodide.mjs`
  : "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs";
const { loadPyodide } = await import(moduleUrl);

const pyodideReady = desktopMode
  ? Promise.all([
      localFileUrlToDataUrl(`${localIndex}pyodide.asm.wasm`),
      localFileUrlToDataUrl(`${localIndex}python_stdlib.zip`),
    ]).then(([wasmURL, stdLibURL]) => loadPyodide({
      indexURL: localIndex,
      lockFileURL: `${localIndex}pyodide-lock.json`,
      stdLibURL,
      _wasmBinaryFile: wasmURL,
    }))
  : loadPyodide();

async function start() {
  try {
    await pyodideReady;
    self.postMessage({ type: "ready" });
  } catch (error) {
    self.postMessage({ type: "error", error: `Kunne ikke starte Python: ${error.message}` });
  }
}

self.onmessage = async (event) => {
  const pyodide = await pyodideReady;
  const code = event.data.code;
  const files = Array.isArray(event.data.files) ? event.data.files : [];
  const inputValues = Array.isArray(event.data.inputs) ? event.data.inputs.map((value) => String(value)) : [];
  let stdout = "";
  let stderr = "";
  let inputTranscript = "";
  let globals = null;

  async function releaseGlobals() {
    if (!globals) return;
    try {
      await pyodide.runPythonAsync(`
import builtins as _skolepython_builtins
if hasattr(_skolepython_builtins, "_skolepython_original_input"):
    _skolepython_builtins.input = _skolepython_builtins._skolepython_original_input
`, { globals });
    } catch {
      // En elev kan ha endret builtins. Oppryddingen skal aldri skjule elevens resultat.
    }
    globals.destroy();
    globals = null;
  }

  pyodide.setStdout({ batched: (text) => { stdout += `${text}\n`; } });
  pyodide.setStderr({ batched: (text) => { stderr += `${text}\n`; } });

  try {
    pyodide.FS.mkdirTree("/home/pyodide");
    pyodide.FS.chdir("/home/pyodide");
    for (const file of files) {
      const name = String(file?.name ?? "").replace(/\\/g, "/").split("/").at(-1);
      if (!name || !/\.(?:txt|csv)$/i.test(name) || typeof file?.content !== "string") continue;
      pyodide.FS.writeFile(name, file.content, { encoding: "utf8" });
    }
    const usesGame = /(?:^|\n)\s*(?:from\s+spill\s+import|import\s+spill\b)/.test(code);
    const packageCode = usesGame
      ? code.replace(/^\s*(?:from\s+spill\s+import.*|import\s+spill(?:\s+as\s+\w+)?\s*)$/gm, "")
      : code;
    await pyodide.loadPackagesFromImports(packageCode);
    stdout = "";
    stderr = "";
    globals = pyodide.globals.get("dict")();
    globals.set("_skolepython_input_values_json", JSON.stringify(inputValues));
    await pyodide.runPythonAsync(`
import builtins as _skolepython_builtins
import json as _skolepython_json

if not hasattr(_skolepython_builtins, "_skolepython_original_input"):
    _skolepython_builtins._skolepython_original_input = _skolepython_builtins.input

_skolepython_input_values = _skolepython_json.loads(_skolepython_input_values_json)
_skolepython_input_index = 0
_skolepython_input_transcript = []
_skolepython_pending_prompt = ""

def _skolepython_input(prompt=""):
    global _skolepython_input_index, _skolepython_pending_prompt
    prompt_text = str(prompt)
    if _skolepython_input_index >= len(_skolepython_input_values):
        _skolepython_pending_prompt = prompt_text
        raise RuntimeError("__SKOLEPYTHON_INPUT_REQUIRED__")
    answer = str(_skolepython_input_values[_skolepython_input_index])
    _skolepython_input_index += 1
    _skolepython_input_transcript.append(f"{prompt_text}{answer}")
    return answer

_skolepython_builtins.input = _skolepython_input
`, { globals });
    const usesTurtle = /(?:^|\n)\s*(?:from\s+turtle\s+import|import\s+turtle\b)/.test(code);
    if (usesTurtle) {
      await pyodide.loadPackage("matplotlib");
      await pyodide.runPythonAsync(`
import math as _math
import sys as _sys
import types as _types
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as _plt
from matplotlib.patches import Polygon as _Polygon

_turtle_module = _types.ModuleType("turtle")
_turtle_figure, _turtle_axes = _plt.subplots(figsize=(10, 7))
_turtle_axes.set_aspect("equal", adjustable="datalim")
_turtle_axes.axis("off")
_turtle_events = []
_turtle_canvas_width = 1000
_turtle_canvas_height = 700
_turtle_background = "white"
_turtle_title = "Turtle-tegning"

def _record(kind, **values):
    if len(_turtle_events) < 5000:
        _turtle_events.append({"kind": kind, **values})

class _Screen:
    def bgcolor(self, color=None):
        global _turtle_background
        if color is None:
            return _turtle_figure.get_facecolor()
        _turtle_background = str(color)
        _turtle_figure.set_facecolor(color)
        _turtle_axes.set_facecolor(color)
        _record("background", color=str(color))
    def title(self, text):
        global _turtle_title
        _turtle_title = str(text)
        _turtle_axes.set_title(str(text))
        _record("title", text=str(text))
    def setup(self, width=None, height=None, startx=None, starty=None):
        global _turtle_canvas_width, _turtle_canvas_height
        if isinstance(width, (int, float)) and width > 0:
            _turtle_canvas_width = int(width)
        if isinstance(height, (int, float)) and height > 0:
            _turtle_canvas_height = int(height)
        _record("screen", width=_turtle_canvas_width, height=_turtle_canvas_height)
        return (_turtle_canvas_width, _turtle_canvas_height)
    def screensize(self, canvwidth=None, canvheight=None, bg=None):
        global _turtle_canvas_width, _turtle_canvas_height
        if isinstance(canvwidth, (int, float)) and canvwidth > 0:
            _turtle_canvas_width = int(canvwidth)
        if isinstance(canvheight, (int, float)) and canvheight > 0:
            _turtle_canvas_height = int(canvheight)
        if bg is not None:
            self.bgcolor(bg)
        _record("screen", width=_turtle_canvas_width, height=_turtle_canvas_height)
        return (_turtle_canvas_width, _turtle_canvas_height)
    def tracer(self, *args, **kwargs):
        return None
    def update(self):
        return None
    def exitonclick(self):
        return None
    def mainloop(self):
        return None

_screen = _Screen()

class Turtle:
    def __init__(self, shape="classic", visible=True):
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0
        self._down = True
        self._pen_color = "#173f3a"
        self._fill_color = "#f4c95d"
        self._width = 2.5
        self._filling = False
        self._fill_points = []
        self._visible = visible

    def _remember(self, x, y):
        if self._filling:
            self._fill_points.append((x, y))

    def _move_to(self, x, y):
        start_x, start_y = self._x, self._y
        if self._down:
            _turtle_axes.plot([self._x, x], [self._y, y], color=self._pen_color, linewidth=self._width, solid_capstyle="round")
        self._x, self._y = float(x), float(y)
        self._remember(self._x, self._y)
        _record(
            "line" if self._down else "move",
            x1=start_x, y1=start_y, x2=self._x, y2=self._y,
            color=str(self._pen_color), width=self._width,
            heading=self._heading, visible=self._visible,
        )

    def forward(self, distance):
        angle = _math.radians(self._heading)
        self._move_to(self._x + float(distance) * _math.cos(angle), self._y + float(distance) * _math.sin(angle))
    fd = forward

    def backward(self, distance):
        self.forward(-float(distance))
    back = backward
    bk = backward

    def right(self, angle):
        self._heading = (self._heading - float(angle)) % 360
        _record("turn", x=self._x, y=self._y, heading=self._heading, visible=self._visible)
    rt = right

    def left(self, angle):
        self._heading = (self._heading + float(angle)) % 360
        _record("turn", x=self._x, y=self._y, heading=self._heading, visible=self._visible)
    lt = left

    def goto(self, x, y=None):
        if y is None:
            x, y = x
        self._move_to(float(x), float(y))
    setpos = goto
    setposition = goto

    def setx(self, x):
        self._move_to(float(x), self._y)

    def sety(self, y):
        self._move_to(self._x, float(y))

    def home(self):
        self.goto(0, 0)
        self._heading = 0

    def circle(self, radius, extent=360, steps=None):
        radius = float(radius)
        extent = float(extent)
        if radius == 0 or extent == 0:
            return
        direction = 1 if radius > 0 else -1
        count = int(steps or max(12, abs(extent) / 6))
        heading = _math.radians(self._heading)
        center_x = self._x - _math.sin(heading) * radius
        center_y = self._y + _math.cos(heading) * radius
        start_angle = _math.atan2(self._y - center_y, self._x - center_x)
        for index in range(1, count + 1):
            angle = start_angle + _math.radians(extent * direction) * index / count
            self._move_to(center_x + abs(radius) * _math.cos(angle), center_y + abs(radius) * _math.sin(angle))
        self._heading = (self._heading + extent * direction) % 360

    def penup(self):
        self._down = False
    up = penup
    pu = penup

    def pendown(self):
        self._down = True
    down = pendown
    pd = pendown

    def isdown(self):
        return self._down

    def pensize(self, width=None):
        if width is None:
            return self._width
        self._width = float(width)
    width = pensize

    def pencolor(self, color=None):
        if color is None:
            return self._pen_color
        self._pen_color = color

    def fillcolor(self, color=None):
        if color is None:
            return self._fill_color
        self._fill_color = color

    def color(self, *colors):
        if not colors:
            return (self._pen_color, self._fill_color)
        self._pen_color = colors[0]
        self._fill_color = colors[-1]

    def begin_fill(self):
        self._filling = True
        self._fill_points = [(self._x, self._y)]

    def end_fill(self):
        if len(self._fill_points) >= 3:
            _turtle_axes.add_patch(_Polygon(self._fill_points, closed=True, facecolor=self._fill_color, edgecolor="none"))
            _record(
                "fill", points=[[x, y] for x, y in self._fill_points],
                color=str(self._fill_color), x=self._x, y=self._y,
                heading=self._heading, visible=self._visible,
            )
        self._filling = False
        self._fill_points = []

    def dot(self, size=None, color=None):
        dot_size = float(size or self._width * 3)
        dot_color = color or self._pen_color
        _turtle_axes.scatter([self._x], [self._y], s=(dot_size ** 2), color=dot_color, zorder=4)
        _record("dot", x=self._x, y=self._y, size=dot_size, color=str(dot_color), heading=self._heading, visible=self._visible)

    def write(self, text, move=False, align="left", font=("Arial", 12, "normal")):
        anchor = {"left": "left", "center": "center", "right": "right"}.get(align, "left")
        size = font[1] if isinstance(font, (tuple, list)) and len(font) > 1 else 12
        _turtle_axes.text(self._x, self._y, str(text), color=self._pen_color, fontsize=size, ha=anchor, va="bottom")
        _record("text", x=self._x, y=self._y, text=str(text), color=str(self._pen_color), size=float(size), align=anchor, heading=self._heading, visible=self._visible)

    def setheading(self, angle):
        self._heading = float(angle) % 360
        _record("turn", x=self._x, y=self._y, heading=self._heading, visible=self._visible)
    seth = setheading

    def heading(self):
        return self._heading

    def position(self):
        return (self._x, self._y)
    pos = position

    def xcor(self):
        return self._x

    def ycor(self):
        return self._y

    def distance(self, x, y=None):
        if y is None:
            x, y = x
        return _math.hypot(float(x) - self._x, float(y) - self._y)

    def towards(self, x, y=None):
        if y is None:
            x, y = x
        return _math.degrees(_math.atan2(float(y) - self._y, float(x) - self._x)) % 360

    def speed(self, value=None):
        return 0

    def hideturtle(self):
        self._visible = False
        _record("visibility", x=self._x, y=self._y, heading=self._heading, visible=False)
    ht = hideturtle

    def showturtle(self):
        self._visible = True
        _record("visibility", x=self._x, y=self._y, heading=self._heading, visible=True)
    st = showturtle

    def shape(self, name=None):
        return name or "classic"

    def stamp(self):
        self.dot(max(8, self._width * 4))
        return 1

    def clear(self):
        _turtle_axes.clear()
        _turtle_axes.set_aspect("equal", adjustable="datalim")
        _turtle_axes.axis("off")
        _record("clear", x=self._x, y=self._y, heading=self._heading, visible=self._visible)

    def reset(self):
        self.clear()
        self.__init__()

_default_turtle = Turtle()

def Screen():
    return _screen

def _turtle_finish():
    _turtle_axes.relim()
    _turtle_axes.autoscale_view()
    _turtle_axes.margins(0.12)
    _turtle_axes.set_aspect("equal", adjustable="datalim")
    _turtle_axes.axis("off")

def _no_op(*args, **kwargs):
    return None

def _default_method(name):
    def call(*args, **kwargs):
        return getattr(_default_turtle, name)(*args, **kwargs)
    return call

_method_names = [
    "forward", "fd", "backward", "back", "bk", "right", "rt", "left", "lt",
    "goto", "setpos", "setposition", "setx", "sety", "home", "circle", "penup",
    "up", "pu", "pendown", "down", "pd", "isdown", "pensize", "width", "pencolor",
    "fillcolor", "color", "begin_fill", "end_fill", "dot", "write", "setheading",
    "seth", "heading", "position", "pos", "xcor", "ycor", "distance", "towards",
    "speed", "hideturtle", "ht", "showturtle", "st", "shape", "stamp", "clear", "reset",
]
for _method_name in _method_names:
    setattr(_turtle_module, _method_name, _default_method(_method_name))

_turtle_module.Turtle = Turtle
_turtle_module.RawTurtle = Turtle
_turtle_module.Screen = Screen
_turtle_module.bgcolor = _screen.bgcolor
_turtle_module.title = _screen.title
_turtle_module.setup = _screen.setup
_turtle_module.screensize = _screen.screensize
_turtle_module.tracer = _screen.tracer
_turtle_module.update = _screen.update
_turtle_module.done = _no_op
_turtle_module.mainloop = _no_op
_turtle_module.exitonclick = _no_op
_turtle_module._finish = _turtle_finish
_turtle_module._events = _turtle_events
_turtle_module._figure = _turtle_figure
_turtle_module.__all__ = _method_names + [
    "Turtle", "RawTurtle", "Screen", "bgcolor", "title", "setup", "screensize",
    "tracer", "update", "done", "mainloop", "exitonclick",
]
_sys.modules["turtle"] = _turtle_module
`, { globals });
    }
    if (usesGame) {
      await pyodide.runPythonAsync(`
import sys as _sys
import types as _types

_spill_module = _types.ModuleType("spill")
_spill_module._game = None

class Snake:
    """En enkel, lokal Snake-motor for Skolepython fra Bjørnsveen."""
    def __init__(
        self,
        bredde=18,
        hoyde=12,
        fart=6,
        slangefarge="#62b88b",
        hodefarge="#f4c95d",
        matfarge="#f06f51",
        bakgrunn="#102e2b",
        rutenett="#ffffff18",
        gjennom_vegg=False,
        tittel="Mitt Snake-spill",
    ):
        self.bredde = max(8, min(30, int(bredde)))
        self.hoyde = max(8, min(22, int(hoyde)))
        self.fart = max(2, min(12, float(fart)))
        self.slangefarge = str(slangefarge)
        self.hodefarge = str(hodefarge)
        self.matfarge = str(matfarge)
        self.bakgrunn = str(bakgrunn)
        self.rutenett = str(rutenett)
        self.gjennom_vegg = bool(gjennom_vegg)
        self.tittel = str(tittel)

    def start(self):
        _spill_module._game = self
        return self

    def _as_dict(self):
        return {
            "width": self.bredde,
            "height": self.hoyde,
            "speed": self.fart,
            "snakeColor": self.slangefarge,
            "headColor": self.hodefarge,
            "foodColor": self.matfarge,
            "background": self.bakgrunn,
            "gridColor": self.rutenett,
            "wrap": self.gjennom_vegg,
            "title": self.tittel,
        }

    def __repr__(self):
        return f"Snake({self.bredde}x{self.hoyde}, fart={self.fart})"

_spill_module.Snake = Snake
_spill_module.__all__ = ["Snake"]
_sys.modules["spill"] = _spill_module
`, { globals });
    }
    const usesMatplotlib = usesTurtle || /\b(matplotlib|pyplot)\b/.test(code);
    if (usesMatplotlib) {
      await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def _bjornsveen_show(*args, **kwargs):
    # Nettleser-/offline-appen viser figurene i resultatpanelet etter kjøring.
    # Derfor skal plt.show() ikke forsøke å åpne Pyodides DOM-baserte vindu.
    return None

plt.show = _bjornsveen_show
`, { globals });
    }
    // Pakkelasting kan skrive tekniske statuslinjer. Elevene skal bare se
    // utskrift fra sitt eget program og eventuelle figurer.
    stdout = "";
    stderr = "";
    await pyodide.runPythonAsync(code, { globals });
    try {
      inputTranscript = await pyodide.runPythonAsync(`
"\\n".join(_skolepython_input_transcript) + ("\\n" if _skolepython_input_transcript else "")
`, { globals });
    } catch {
      inputTranscript = "";
    }
    let turtle = null;
    if (usesTurtle) try {
      const encodedTurtle = await pyodide.runPythonAsync(`
import json
import turtle as _bjornsveen_turtle

json.dumps({
    "events": _bjornsveen_turtle._events,
    "canvasWidth": _turtle_canvas_width,
    "canvasHeight": _turtle_canvas_height,
    "background": _turtle_background,
    "title": _turtle_title,
    "truncated": len(_bjornsveen_turtle._events) >= 5000,
})
`, { globals });
      turtle = JSON.parse(encodedTurtle);
    } catch {
      turtle = null;
    }
    let plots = [];
    if (usesMatplotlib) try {
      const encodedPlots = await pyodide.runPythonAsync(`
import base64
import io
import json

_bjornsveen_plots = []
try:
    import matplotlib.pyplot as plt
    _bjornsveen_turtle_figure_number = None
    try:
        import turtle as _bjornsveen_turtle
        if hasattr(_bjornsveen_turtle, "_finish"):
            _bjornsveen_turtle._finish()
        if hasattr(_bjornsveen_turtle, "_figure"):
            _bjornsveen_turtle_figure_number = _bjornsveen_turtle._figure.number
    except ImportError:
        pass
    for _bjornsveen_figure_number in plt.get_fignums():
        if _bjornsveen_figure_number == _bjornsveen_turtle_figure_number:
            continue
        _bjornsveen_figure = plt.figure(_bjornsveen_figure_number)
        _bjornsveen_buffer = io.BytesIO()
        _bjornsveen_figure.savefig(
            _bjornsveen_buffer,
            format="png",
            dpi=240,
            bbox_inches="tight",
            facecolor="white",
        )
        _bjornsveen_plots.append(base64.b64encode(_bjornsveen_buffer.getvalue()).decode("ascii"))
    plt.close("all")
except ImportError:
    pass

json.dumps(_bjornsveen_plots)
`, { globals });
      plots = JSON.parse(encodedPlots);
    } catch {
      plots = [];
    }
    let game = null;
    if (usesGame) try {
      const encodedGame = await pyodide.runPythonAsync(`
import json
import spill as _bjornsveen_spill

json.dumps(_bjornsveen_spill._game._as_dict() if _bjornsveen_spill._game is not None else None)
`, { globals });
      game = JSON.parse(encodedGame);
    } catch {
      game = null;
    }
    let variables = [];
    try {
      const encodedVariables = await pyodide.runPythonAsync(`
import json as _skolepython_json
import types as _skolepython_types

_skolepython_variables = []
for _skolepython_name, _skolepython_value in list(globals().items()):
    if _skolepython_name.startswith("_"):
        continue
    if isinstance(_skolepython_value, _skolepython_types.ModuleType) or callable(_skolepython_value):
        continue
    _skolepython_type = type(_skolepython_value).__name__
    try:
        _skolepython_display = repr(_skolepython_value)
    except Exception:
        _skolepython_display = f"<{_skolepython_type}>"
    if len(_skolepython_display) > 140:
        _skolepython_display = _skolepython_display[:137] + "..."
    _skolepython_variables.append({
        "name": _skolepython_name,
        "type": _skolepython_type,
        "value": _skolepython_display,
    })

_skolepython_json.dumps(_skolepython_variables[:30], ensure_ascii=False)
`, { globals });
      variables = JSON.parse(encodedVariables);
    } catch {
      variables = [];
    }
    await releaseGlobals();
    self.postMessage({ type: "result", output: `${inputTranscript}${stdout}${stderr}`, plots, turtle, game, variables });
  } catch (error) {
    const message = String(error?.message ?? error);
    if (globals && message.includes("__SKOLEPYTHON_INPUT_REQUIRED__")) {
      let prompt = "Skriv et svar:";
      try {
        prompt = String(globals.get("_skolepython_pending_prompt") || prompt);
      } catch {
        // Standardteksten er tydelig nok dersom prompten ikke kan leses.
      }
      await releaseGlobals();
      self.postMessage({ type: "input", prompt, index: inputValues.length, output: `${stdout}${stderr}` });
      return;
    }
    await releaseGlobals();
    self.postMessage({ type: "error", error: message });
  }
};

start();
