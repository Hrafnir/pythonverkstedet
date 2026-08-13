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
  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text) => { stdout += `${text}\n`; } });
  pyodide.setStderr({ batched: (text) => { stderr += `${text}\n`; } });

  try {
    await pyodide.loadPackagesFromImports(code);
    stdout = "";
    stderr = "";
    const globals = pyodide.globals.get("dict")();
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
_turtle_figure, _turtle_axes = _plt.subplots(figsize=(7, 7))
_turtle_axes.set_aspect("equal", adjustable="datalim")
_turtle_axes.axis("off")

class _Screen:
    def bgcolor(self, color=None):
        if color is None:
            return _turtle_figure.get_facecolor()
        _turtle_figure.set_facecolor(color)
        _turtle_axes.set_facecolor(color)
    def title(self, text):
        _turtle_axes.set_title(str(text))
    def setup(self, width=None, height=None, startx=None, starty=None):
        return None
    def screensize(self, canvwidth=None, canvheight=None, bg=None):
        if bg is not None:
            self.bgcolor(bg)
        return (canvwidth or 600, canvheight or 600)
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
        if self._down:
            _turtle_axes.plot([self._x, x], [self._y, y], color=self._pen_color, linewidth=self._width, solid_capstyle="round")
        self._x, self._y = float(x), float(y)
        self._remember(self._x, self._y)

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
    rt = right

    def left(self, angle):
        self._heading = (self._heading + float(angle)) % 360
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
        self._filling = False
        self._fill_points = []

    def dot(self, size=None, color=None):
        _turtle_axes.scatter([self._x], [self._y], s=(float(size or self._width * 3) ** 2), color=color or self._pen_color, zorder=4)

    def write(self, text, move=False, align="left", font=("Arial", 12, "normal")):
        anchor = {"left": "left", "center": "center", "right": "right"}.get(align, "left")
        size = font[1] if isinstance(font, (tuple, list)) and len(font) > 1 else 12
        _turtle_axes.text(self._x, self._y, str(text), color=self._pen_color, fontsize=size, ha=anchor, va="bottom")

    def setheading(self, angle):
        self._heading = float(angle) % 360
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
    ht = hideturtle

    def showturtle(self):
        self._visible = True
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
_turtle_module.__all__ = _method_names + [
    "Turtle", "RawTurtle", "Screen", "bgcolor", "title", "setup", "screensize",
    "tracer", "update", "done", "mainloop", "exitonclick",
]
_sys.modules["turtle"] = _turtle_module
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
    let plots = [];
    if (usesMatplotlib) try {
      const encodedPlots = await pyodide.runPythonAsync(`
import base64
import io
import json

_bjornsveen_plots = []
try:
    import matplotlib.pyplot as plt
    try:
        import turtle as _bjornsveen_turtle
        if hasattr(_bjornsveen_turtle, "_finish"):
            _bjornsveen_turtle._finish()
    except ImportError:
        pass
    for _bjornsveen_figure_number in plt.get_fignums():
        _bjornsveen_figure = plt.figure(_bjornsveen_figure_number)
        _bjornsveen_buffer = io.BytesIO()
        _bjornsveen_figure.savefig(
            _bjornsveen_buffer,
            format="png",
            dpi=170,
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
    globals.destroy();
    self.postMessage({ type: "result", output: `${stdout}${stderr}`, plots });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

start();
