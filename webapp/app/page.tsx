import { exampleFiles, exampleDataFiles, completeExample } from "./lib/exampleFiles";

import LessonPanel from "./components/LessonPanel";
import PracticePanel from "./components/PracticePanel";
import CoursePrint from "./components/CoursePrint";
import { learningOrder } from "./content/learning";
import type { HelpExample } from "./components/HelpPanel";
const HelpPanel = lazy(() => import("./components/HelpPanel"));
const TeacherView = lazy(() => import("./components/TeacherView"));
import { analyzePythonError } from "./lib/pythonErrors";
import type { ErrorCoach } from "./lib/pythonErrors";
import { PythonEditor } from "./components/PythonEditor";
import { readStored, writeStored, isCodeMap } from "./lib/storage";
import { modules } from "./content/course";
import type { Module } from "./content/course";
"use client";
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import type { ChangeEvent, CSSProperties, FormEvent, KeyboardEvent } from "react";
import { challengeDifficulties, evaluateChallengeAttempt, pythonChallenges } from "./challenges";
import type { ChallengeDifficulty, PythonChallenge } from "./challenges";
import { evaluateExamAttempt, examLevels, examTasks } from "./examTraining";
import type { ExamLevel, ExamTask } from "./examTraining";
import { pygameTutorials } from "./pygameTutorials";
import type { PygameTutorial } from "./pygameTutorials";

type LocalProject = {
  id: string;
  name: string;
  code: string;
  updatedAt: string;
  files?: ProjectFile[];
  activeFileId?: string;
};

type ProjectFile = {
  id: string;
  name: string;
  code: string;
};

type PythonDataFile = {
  name: string;
  content: string;
  size: number;
};

type PythonVariable = {
  name: string;
  type: string;
  value: string;
  size?: string;
  shape?: string;
};

type PythonTraceStep = {
  line: number;
  code: string;
  variables: PythonVariable[];
};

type TurtleEvent = {
  kind: "line" | "move" | "turn" | "fill" | "dot" | "text" | "visibility" | "clear" | "background" | "title" | "screen";
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  heading?: number;
  visible?: boolean;
  color?: string;
  width?: number;
  size?: number;
  text?: string;
  align?: CanvasTextAlign;
  points?: [number, number][];
};

type TurtleDrawing = {
  events: TurtleEvent[];
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  title: string;
  truncated?: boolean;
};

type SnakeGameConfig = {
  width: number;
  height: number;
  speed: number;
  snakeColor: string;
  headColor: string;
  foodColor: string;
  background: string;
  gridColor: string;
  wrap: boolean;
  title: string;
};

function normalizeCommandSearch(value: string) {
  return value
    .toLocaleLowerCase("nb")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .trim();
}

type TurtleVectorMode = "centerline" | "edges" | "outline";

type TurtleWorkshopSettings = {
  mode: TurtleVectorMode;
  strokeWidthMm: number;
  outputWidthMm: number;
  color: string;
  useCodeColors: boolean;
  useCodeWidths: boolean;
  includeFills: boolean;
  includeText: boolean;
  lineCap: "round" | "square";
};

type TurtlePath = {
  points: [number, number][];
  color: string;
  widthMm: number;
};

const defaultTurtleWorkshop: TurtleWorkshopSettings = {
  mode: "centerline",
  strokeWidthMm: 1,
  outputWidthMm: 150,
  color: "#173f3a",
  useCodeColors: true,
  useCodeWidths: true,
  includeFills: true,
  includeText: false,
  lineCap: "round",
};
const legacyPlaygroundCode = `# Dette er deres frie Python-rom.
# Slett eksemplet eller bygg videre på det.

navn = "10. trinn"
for tall in range(1, 6):
    print(navn, "utforsker", tall ** 2)`;

const playgroundCode = "";

const firstProject: LocalProject = {
  id: "mitt-forste-prosjekt",
  name: "Nytt program",
  code: playgroundCode,
  updatedAt: new Date(0).toISOString(),
};

function projectMainFile(project: LocalProject): ProjectFile {
  return {
    id: `${project.id}-main`,
    name: `${safeProjectName(project.name)}.py`,
    code: project.code ?? "",
  };
}

function normalizeProject(project: LocalProject): LocalProject {
  const files = project.files?.length
    ? project.files.map((file) => ({ ...file, name: file.name.toLowerCase().endsWith(".py") ? file.name : `${file.name}.py` }))
    : [projectMainFile(project)];
  const activeFileId = files.some((file) => file.id === project.activeFileId) ? project.activeFileId : files[0].id;
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  return { ...project, code: activeFile.code, files, activeFileId };
}

function activeProjectFile(project: LocalProject) {
  const normalized = normalizeProject(project);
  return normalized.files?.find((file) => file.id === normalized.activeFileId) ?? normalized.files?.[0] ?? projectMainFile(project);
}

function updateActiveProjectFile(project: LocalProject, nextCode: string): LocalProject {
  const normalized = normalizeProject(project);
  const files = normalized.files!.map((file) => file.id === normalized.activeFileId ? { ...file, code: nextCode } : file);
  return { ...normalized, code: nextCode, files, updatedAt: new Date().toISOString() };
}

function safeProjectName(name: string) {
  return name.trim().replace(/[\\/:*?"<>|]+/g, "-") || "python-prosjekt";
}

function turtleViewport(drawing: TurtleDrawing) {
  const requestedWidth = Math.max(400, drawing.canvasWidth || 1000);
  const requestedHeight = Math.max(300, drawing.canvasHeight || 700);
  const hasExplicitScreen = drawing.events.some((event) => event.kind === "screen");
  const coordinates: [number, number][] = hasExplicitScreen
    ? [[-requestedWidth / 2, -requestedHeight / 2], [requestedWidth / 2, requestedHeight / 2]]
    : [[0, 0]];
  for (const event of drawing.events) {
    if (event.x1 !== undefined && event.y1 !== undefined) coordinates.push([event.x1, event.y1]);
    if (event.x2 !== undefined && event.y2 !== undefined) coordinates.push([event.x2, event.y2]);
    if (event.x !== undefined && event.y !== undefined) coordinates.push([event.x, event.y]);
    if (event.points) coordinates.push(...event.points);
  }
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minimumAutoWidth = 300;
  const minimumAutoHeight = minimumAutoWidth * requestedHeight / requestedWidth;
  const spanX = Math.max(hasExplicitScreen ? requestedWidth : minimumAutoWidth, maxX - minX);
  const spanY = Math.max(hasExplicitScreen ? requestedHeight : minimumAutoHeight, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const outputRatio = requestedWidth / requestedHeight;
  let worldWidth = spanX / 0.92;
  let worldHeight = spanY / 0.92;
  if (worldWidth / worldHeight > outputRatio) worldHeight = worldWidth / outputRatio;
  else worldWidth = worldHeight * outputRatio;
  return { requestedWidth, requestedHeight, centerX, centerY, worldWidth, worldHeight };
}

function finalTurtleEvents(events: TurtleEvent[]) {
  let lastClear = -1;
  events.forEach((event, index) => { if (event.kind === "clear") lastClear = index; });
  return events.slice(lastClear + 1);
}

function samePoint(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) < 0.0001 && Math.abs(a[1] - b[1]) < 0.0001;
}

function turtlePaths(events: TurtleEvent[], settings: TurtleWorkshopSettings) {
  const paths: TurtlePath[] = [];
  let current: TurtlePath | null = null;
  for (const event of finalTurtleEvents(events)) {
    if (event.kind !== "line" || event.x1 === undefined || event.y1 === undefined || event.x2 === undefined || event.y2 === undefined) {
      if (event.kind === "move") current = null;
      continue;
    }
    const color = settings.useCodeColors ? (event.color || settings.color) : settings.color;
    const widthMm = settings.useCodeWidths ? Math.max(0.1, (event.width || 2.5) * 0.12) : settings.strokeWidthMm;
    const start: [number, number] = [event.x1, event.y1];
    const end: [number, number] = [event.x2, event.y2];
    if (!current || current.color !== color || current.widthMm !== widthMm || !samePoint(current.points[current.points.length - 1], start)) {
      current = { points: [start, end], color, widthMm };
      paths.push(current);
    } else {
      current.points.push(end);
    }
  }
  return paths;
}

function offsetTurtlePath(points: [number, number][], distance: number) {
  if (points.length < 2) return { left: points, right: points, closed: false };
  const closed = points.length > 2 && samePoint(points[0], points[points.length - 1]);
  const source = closed ? points.slice(0, -1) : points;
  const normal = (start: [number, number], end: [number, number]) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy) || 1;
    return [-dy / length, dx / length] as [number, number];
  };
  const offsetPoint = (index: number, side: number) => {
    const point = source[index];
    const previousIndex = index === 0 ? (closed ? source.length - 1 : 0) : index - 1;
    const nextIndex = index === source.length - 1 ? (closed ? 0 : source.length - 1) : index + 1;
    const previousNormal = normal(source[previousIndex], point);
    const nextNormal = normal(point, source[nextIndex]);
    if (!closed && index === 0) return [point[0] + nextNormal[0] * distance * side, point[1] + nextNormal[1] * distance * side] as [number, number];
    if (!closed && index === source.length - 1) return [point[0] + previousNormal[0] * distance * side, point[1] + previousNormal[1] * distance * side] as [number, number];
    const sumX = previousNormal[0] + nextNormal[0];
    const sumY = previousNormal[1] + nextNormal[1];
    const sumLength = Math.hypot(sumX, sumY);
    if (sumLength < 0.001) return [point[0] + nextNormal[0] * distance * side, point[1] + nextNormal[1] * distance * side] as [number, number];
    const miterX = sumX / sumLength;
    const miterY = sumY / sumLength;
    const denominator = Math.max(0.25, Math.abs(miterX * nextNormal[0] + miterY * nextNormal[1]));
    const miterDistance = Math.min(distance * 4, distance / denominator) * side;
    return [point[0] + miterX * miterDistance, point[1] + miterY * miterDistance] as [number, number];
  };
  const left = source.map((_, index) => offsetPoint(index, 1));
  const right = source.map((_, index) => offsetPoint(index, -1));
  if (closed) {
    left.push(left[0]);
    right.push(right[0]);
  }
  return { left, right, closed };
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createTurtleSvg(drawing: TurtleDrawing, settings: TurtleWorkshopSettings) {
  const viewport = turtleViewport(drawing);
  const widthMm = Math.max(20, settings.outputWidthMm);
  const heightMm = widthMm * viewport.worldHeight / viewport.worldWidth;
  const worldUnitsPerMm = viewport.worldWidth / widthMm;
  const hairlineWorld = 0.1 * worldUnitsPerMm;
  const viewLeft = viewport.centerX - viewport.worldWidth / 2;
  const viewTop = -viewport.centerY - viewport.worldHeight / 2;
  const coordinate = ([x, y]: [number, number]) => `${Number(x.toFixed(4))},${Number((-y).toFixed(4))}`;
  const openPath = (points: [number, number][]) => points.map((point, index) => `${index ? "L" : "M"}${coordinate(point)}`).join(" ");
  const vectorElements: string[] = [];
  const fillElements: string[] = [];
  const textElements: string[] = [];

  for (const path of turtlePaths(drawing.events, settings)) {
    if (path.points.length < 2) continue;
    const color = xmlEscape(path.color);
    const strokeWorld = Math.max(0.05, path.widthMm) * worldUnitsPerMm;
    if (settings.mode === "centerline") {
      vectorElements.push(`<path d="${openPath(path.points)}" fill="none" stroke="${color}" stroke-width="${strokeWorld}" stroke-linecap="${settings.lineCap}" stroke-linejoin="round"/>`);
      continue;
    }
    const offsets = offsetTurtlePath(path.points, strokeWorld / 2);
    if (settings.mode === "edges" || offsets.closed) {
      vectorElements.push(`<path d="${openPath(offsets.left)}" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
      vectorElements.push(`<path d="${openPath(offsets.right)}" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
    } else {
      const outline = [...offsets.left, ...offsets.right.slice().reverse()];
      vectorElements.push(`<path d="${openPath(outline)} Z" fill="none" stroke="${color}" stroke-width="${hairlineWorld}" stroke-linejoin="round"/>`);
    }
  }

  if (settings.includeFills) {
    for (const event of finalTurtleEvents(drawing.events)) {
      const color = xmlEscape(settings.useCodeColors ? (event.color || settings.color) : settings.color);
      if (event.kind === "fill" && event.points && event.points.length >= 3) {
        fillElements.push(`<path d="${openPath(event.points)} Z" fill="${color}" stroke="none"/>`);
      }
      if (event.kind === "dot" && event.x !== undefined && event.y !== undefined) {
        const radius = Math.max(0.05 * worldUnitsPerMm, (event.size || 6) / 2);
        fillElements.push(`<circle cx="${event.x}" cy="${-event.y}" r="${radius}" fill="${color}"/>`);
      }
    }
  }

  if (settings.includeText) {
    for (const event of finalTurtleEvents(drawing.events)) {
      if (event.kind !== "text" || event.x === undefined || event.y === undefined) continue;
      const color = xmlEscape(settings.useCodeColors ? (event.color || settings.color) : settings.color);
      const anchor = event.align === "center" ? "middle" : event.align === "right" ? "end" : "start";
      textElements.push(`<text x="${event.x}" y="${-event.y}" fill="${color}" font-family="Arial, sans-serif" font-size="${event.size || 12}" text-anchor="${anchor}">${xmlEscape(event.text || "")}</text>`);
    }
  }

  const modeNames: Record<TurtleVectorMode, string> = { centerline: "senterlinje", edges: "to ytterlinjer", outline: "lukket omriss" };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${Number(heightMm.toFixed(2))}mm" viewBox="${viewLeft} ${viewTop} ${viewport.worldWidth} ${viewport.worldHeight}">\n  <title>${xmlEscape(drawing.title || "Turtle-tegning")}</title>\n  <desc>Laget i Skolepython fra Bjørnsveen. Vektortype: ${modeNames[settings.mode]}. Transparent bakgrunn.</desc>\n  <g id="turtle-vektorer">\n    ${[...fillElements, ...vectorElements, ...textElements].join("\n    ")}\n  </g>\n</svg>\n`;
}

function renderTurtleFrame(canvas: HTMLCanvasElement, drawing: TurtleDrawing, frame: number, workshop = defaultTurtleWorkshop, workshopPreview = false) {
  const outputWidth = 1400;
  const viewport = turtleViewport(drawing);
  const { requestedWidth, requestedHeight, centerX, centerY } = viewport;
  const outputHeight = Math.round(outputWidth * requestedHeight / requestedWidth);
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) return;
  const layer = document.createElement("canvas");
  layer.width = outputWidth;
  layer.height = outputHeight;
  const layerContext = layer.getContext("2d");
  if (!layerContext) return;

  const events = drawing.events.slice(0, Math.max(0, frame));
  const scale = outputWidth / viewport.worldWidth;
  const point = (x = 0, y = 0) => ({
    x: outputWidth / 2 + (x - centerX) * scale,
    y: outputHeight / 2 - (y - centerY) * scale,
  });

  let background = "white";
  let title = drawing.title || "Turtle-tegning";
  let cursor = { x: 0, y: 0, heading: 0, visible: true };

  for (const event of events) {
    if (event.kind === "background") {
      background = event.color || background;
      continue;
    }
    if (event.kind === "title") {
      title = event.text || title;
      continue;
    }
    if (event.x2 !== undefined && event.y2 !== undefined) cursor = { x: event.x2, y: event.y2, heading: event.heading ?? cursor.heading, visible: event.visible ?? cursor.visible };
    else if (event.x !== undefined && event.y !== undefined) cursor = { x: event.x, y: event.y, heading: event.heading ?? cursor.heading, visible: event.visible ?? cursor.visible };
  }

  const visibleEvents = finalTurtleEvents(events);
  if (workshop.includeFills) {
    for (const event of visibleEvents) {
      if (event.kind === "fill" && event.points && event.points.length >= 3) {
        layerContext.save();
        layerContext.globalCompositeOperation = "destination-over";
        layerContext.beginPath();
        event.points.forEach(([x, y], index) => {
          const next = point(x, y);
          if (index === 0) layerContext.moveTo(next.x, next.y);
          else layerContext.lineTo(next.x, next.y);
        });
        layerContext.closePath();
        layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
        layerContext.fill();
        layerContext.restore();
      }
      if (event.kind === "dot") {
        const center = point(event.x, event.y);
        layerContext.beginPath();
        layerContext.arc(center.x, center.y, Math.max(0.5, Math.max(0.05 * viewport.worldWidth / Math.max(20, workshop.outputWidthMm), (event.size || 6) / 2) * scale), 0, Math.PI * 2);
        layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
        layerContext.fill();
      }
    }
  }

  const drawVectorPath = (points: [number, number][], color: string, width: number, close = false, lineCap: CanvasLineCap = "butt") => {
    if (points.length < 2) return;
    layerContext.beginPath();
    points.forEach(([x, y], index) => {
      const next = point(x, y);
      if (index === 0) layerContext.moveTo(next.x, next.y);
      else layerContext.lineTo(next.x, next.y);
    });
    if (close) layerContext.closePath();
    layerContext.fillStyle = "transparent";
    layerContext.strokeStyle = color;
    layerContext.lineWidth = width;
    layerContext.lineCap = lineCap;
    layerContext.lineJoin = "round";
    layerContext.stroke();
  };

  for (const path of turtlePaths(events, workshop)) {
    const strokePixels = Math.max(0.5, path.widthMm / Math.max(20, workshop.outputWidthMm) * outputWidth);
    if (workshop.mode === "centerline") {
      drawVectorPath(path.points, path.color, strokePixels, false, workshop.lineCap);
      continue;
    }
    const worldUnitsPerMm = viewport.worldWidth / Math.max(20, workshop.outputWidthMm);
    const offsets = offsetTurtlePath(path.points, path.widthMm * worldUnitsPerMm / 2);
    const hairlinePixels = Math.max(0.5, 0.1 / Math.max(20, workshop.outputWidthMm) * outputWidth);
    if (workshop.mode === "edges" || offsets.closed) {
      drawVectorPath(offsets.left, path.color, hairlinePixels);
      drawVectorPath(offsets.right, path.color, hairlinePixels);
    } else {
      drawVectorPath([...offsets.left, ...offsets.right.slice().reverse()], path.color, hairlinePixels, true);
    }
  }

  if (workshop.includeText) {
    for (const event of visibleEvents) {
      if (event.kind !== "text") continue;
      const textPoint = point(event.x, event.y);
      layerContext.fillStyle = workshop.useCodeColors ? (event.color || workshop.color) : workshop.color;
      layerContext.font = `${Math.max(13, (event.size || 12) * Math.min(2, Math.max(1, scale / 8)))}px Arial, sans-serif`;
      layerContext.textAlign = event.align || "left";
      layerContext.textBaseline = "bottom";
      layerContext.fillText(event.text || "", textPoint.x, textPoint.y);
    }
  }

  context.fillStyle = background;
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(layer, 0, 0);

  if (!workshopPreview && cursor.visible && frame > 0) {
    const cursorPoint = point(cursor.x, cursor.y);
    const angle = -cursor.heading * Math.PI / 180;
    context.save();
    context.translate(cursorPoint.x, cursorPoint.y);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(15, 0);
    context.lineTo(-10, -9);
    context.lineTo(-6, 0);
    context.lineTo(-10, 9);
    context.closePath();
    context.fillStyle = "#f06f51";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    context.restore();
  }
  canvas.dataset.turtleTitle = title;
}

function TurtlePlayer({ drawing, settings, onSettingsChange, onDownload, onDownloadSvg, onExpand, large = false }: {
  drawing: TurtleDrawing;
  settings: TurtleWorkshopSettings;
  onSettingsChange: (settings: TurtleWorkshopSettings) => void;
  onDownload: (settings: TurtleWorkshopSettings) => void;
  onDownloadSvg: (settings: TurtleWorkshopSettings) => void;
  onExpand?: () => void;
  large?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [colorDraft, setColorDraft] = useState(settings.color);
  const [workshopPreview, setWorkshopPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFrame = drawing.events.length;

  useEffect(() => {
    setFrame(0);
    setPlaying(true);
    setWorkshopPreview(false);
  }, [drawing]);

  useEffect(() => setColorDraft(settings.color), [settings.color]);

  useEffect(() => {
    if (canvasRef.current) renderTurtleFrame(canvasRef.current, drawing, frame, settings, workshopPreview);
  }, [drawing, frame, settings, workshopPreview]);

  useEffect(() => {
    if (!playing || frame >= lastFrame) {
      if (frame >= lastFrame) setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setFrame((current) => Math.min(lastFrame, current + 1)), 150 / speed);
    return () => window.clearTimeout(timer);
  }, [frame, lastFrame, playing, speed]);

  const svgHeight = settings.outputWidthMm * turtleViewport(drawing).worldHeight / turtleViewport(drawing).worldWidth;
  const modeHelp: Record<TurtleVectorMode, string> = {
    centerline: "Én vektor midt i streken. Passer til lasergravering, penn og plotter.",
    edges: "To åpne vektorer langs hver ytterkant. Nyttig når begge kantene skal bearbeides.",
    outline: "Et lukket omriss rundt streken. Dette er vanligst til vinylkutting og utskjæring.",
  };
  const updateWorkshop = <Key extends keyof TurtleWorkshopSettings,>(key: Key, value: TurtleWorkshopSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  const applyColorDraft = () => {
    const normalized = colorDraft.trim();
    if (/^#[0-9a-f]{6}$/i.test(normalized)) updateWorkshop("color", normalized.toLowerCase());
    else setColorDraft(settings.color);
  };

  return (
    <figure className={`turtle-player ${large ? "is-large" : ""}`}>
      <div className="turtle-heading">
        <div><span>Turtle-canvas</span><strong>{drawing.title || "Turtle-tegning"}</strong></div>
        <span>{workshopPreview ? "SVG-forhåndsvisning" : frame === lastFrame ? "Ferdig" : `Steg ${frame} av ${lastFrame}`}</span>
      </div>
      <div className="turtle-canvas-wrap">
        <canvas ref={canvasRef} aria-label={workshopPreview ? `${drawing.title || "Turtle-tegning"}, forhåndsvisning av eksportert SVG` : `${drawing.title || "Turtle-tegning"}, steg ${frame} av ${lastFrame}`} />
        <details className="turtle-maker-menu" onToggle={(event) => {
          const open = event.currentTarget.open;
          if (open) {
            setWorkshopPreview(true);
            setPlaying(false);
            setFrame(lastFrame);
          }
        }}>
          <summary><span>◇</span> Skaperverksted</summary>
          <div className="turtle-maker-panel">
            <header>
              <div><small>SVG-VERKTØY</small><strong>Gjør mønsteret klart for maskinen</strong></div>
              <span>{settings.outputWidthMm.toFixed(0)} × {svgHeight.toFixed(0)} mm</span>
            </header>
            <label>Vektortype
              <select value={settings.mode} onChange={(event) => updateWorkshop("mode", event.target.value as TurtleVectorMode)}>
                <option value="centerline">Senterlinje</option>
                <option value="edges">To ytterlinjer</option>
                <option value="outline">Lukket omriss</option>
              </select>
            </label>
            <p className="maker-mode-help">{modeHelp[settings.mode]}</p>
            <div className="maker-number-grid">
              <label>Strektykkelse
                <span><input type="number" min="0.1" max="50" step="0.1" value={settings.strokeWidthMm} disabled={settings.useCodeWidths} onChange={(event) => updateWorkshop("strokeWidthMm", Math.min(50, Math.max(0.1, Number(event.target.value) || 0.1)))} /> mm</span>
              </label>
              <label>Ferdig bredde
                <span><input type="number" min="20" max="1000" step="5" value={settings.outputWidthMm} onChange={(event) => updateWorkshop("outputWidthMm", Math.min(1000, Math.max(20, Number(event.target.value) || 20)))} /> mm</span>
              </label>
            </div>
            <label className="maker-range"><span>Tykkelse i forhåndsvisningen</span>
              <input type="range" min="0.1" max="20" step="0.1" value={Math.min(20, settings.strokeWidthMm)} disabled={settings.useCodeWidths} onChange={(event) => updateWorkshop("strokeWidthMm", Number(event.target.value))} />
            </label>
            <label className="maker-check"><input type="checkbox" checked={settings.useCodeWidths} onChange={(event) => updateWorkshop("useCodeWidths", event.target.checked)} /> Behold tykkelser fra Python-koden</label>
            <div className="maker-color-row">
              <label>Vektorfarge
                <span className="maker-color-inputs">
                  <input type="color" value={settings.color} disabled={settings.useCodeColors} onChange={(event) => updateWorkshop("color", event.target.value)} />
                  <input
                    type="text"
                    aria-label="Fargekode"
                    value={colorDraft}
                    disabled={settings.useCodeColors}
                    onChange={(event) => setColorDraft(event.target.value)}
                    onBlur={applyColorDraft}
                    onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                    spellCheck={false}
                  />
                </span>
              </label>
              <label className="maker-check"><input type="checkbox" checked={settings.useCodeColors} onChange={(event) => updateWorkshop("useCodeColors", event.target.checked)} /> Behold farger fra Python</label>
            </div>
            <div className="maker-options">
              <label className="maker-check"><input type="checkbox" checked={settings.includeFills} onChange={(event) => updateWorkshop("includeFills", event.target.checked)} /> Ta med fyll og prikker</label>
              <label className="maker-check"><input type="checkbox" checked={settings.includeText} onChange={(event) => updateWorkshop("includeText", event.target.checked)} /> Ta med tekst</label>
              <label>Strekender på senterlinje
                <select value={settings.lineCap} onChange={(event) => updateWorkshop("lineCap", event.target.value as "round" | "square")}>
                  <option value="round">Runde</option>
                  <option value="square">Rette</option>
                </select>
              </label>
            </div>
            {settings.includeText && <p className="maker-warning">Tekst lagres som redigerbar SVG-tekst. Gjør teksten om til kurver i vektorprogrammet før kutting.</p>}
            <footer>
              <span>Transparent bakgrunn · ekte vektorer</span>
              <button type="button" onClick={() => onDownloadSvg(settings)}>Last ned SVG</button>
            </footer>
          </div>
        </details>
      </div>
      <div className="turtle-timeline">
        <input
          type="range"
          min="0"
          max={Math.max(1, lastFrame)}
          value={frame}
          onChange={(event) => { setWorkshopPreview(false); setPlaying(false); setFrame(Number(event.target.value)); }}
          aria-label="Velg steg i Turtle-tegningen"
        />
      </div>
      <figcaption className="turtle-controls">
        <div className="turtle-playback" aria-label="Avspillingsknapper">
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame(0); }} aria-label="Start på nytt">↺</button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame((current) => Math.max(0, current - 1)); }} disabled={frame === 0} aria-label="Ett steg tilbake">←</button>
          <button className="turtle-play" type="button" onClick={() => { setWorkshopPreview(false); if (frame >= lastFrame) setFrame(0); setPlaying((current) => !current); }} disabled={lastFrame === 0}>
            {playing ? "Pause" : "Spill"}
          </button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame((current) => Math.min(lastFrame, current + 1)); }} disabled={frame >= lastFrame} aria-label="Ett steg fram">→</button>
          <button type="button" onClick={() => { setWorkshopPreview(false); setPlaying(false); setFrame(lastFrame); }}>{workshopPreview ? "Vis Turtle" : "Vis ferdig"}</button>
        </div>
        <label className="turtle-speed">Hastighet
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value="0.25">0,25×</option>
            <option value="0.5">0,5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </label>
        <div className="turtle-actions">
          {onExpand && <button type="button" onClick={onExpand}>Åpne stort</button>}
          <button type="button" onClick={() => onDownload(settings)}>Lagre PNG</button>
          <button className="turtle-svg-button" type="button" onClick={() => onDownloadSvg(settings)}>Lagre SVG</button>
        </div>
      </figcaption>
      {drawing.truncated && <p className="turtle-warning">Tegningen har over 5000 steg. De første 5000 vises for å holde appen rask.</p>}
    </figure>
  );
}

type SnakeDirection = "opp" | "ned" | "venstre" | "hoyre";
type SnakePoint = [number, number];
type SnakeRound = {
  snake: SnakePoint[];
  food: SnakePoint;
  direction: SnakeDirection;
  score: number;
  gameOver: boolean;
  message: string;
};

const snakeVectors: Record<SnakeDirection, SnakePoint> = {
  opp: [0, -1],
  ned: [0, 1],
  venstre: [-1, 0],
  hoyre: [1, 0],
};
const oppositeSnakeDirection: Record<SnakeDirection, SnakeDirection> = {
  opp: "ned",
  ned: "opp",
  venstre: "hoyre",
  hoyre: "venstre",
};

function nextSnakeFood(width: number, height: number, snake: SnakePoint[]): SnakePoint {
  const occupied = new Set(snake.map(([x, y]) => `${x},${y}`));
  const free: SnakePoint[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push([x, y]);
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? [0, 0];
}

function initialSnakeRound(config: SnakeGameConfig): SnakeRound {
  const x = Math.max(3, Math.floor(config.width / 3));
  const y = Math.floor(config.height / 2);
  const snake: SnakePoint[] = [[x, y], [x - 1, y], [x - 2, y]];
  return {
    snake,
    food: nextSnakeFood(config.width, config.height, snake),
    direction: "hoyre",
    score: 0,
    gameOver: false,
    message: "Trykk Start og bruk piltastene.",
  };
}

function SnakePlayer({ config, onRestart }: { config: SnakeGameConfig; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<HTMLDivElement | null>(null);
  const directionRef = useRef<SnakeDirection>("hoyre");
  const [round, setRound] = useState<SnakeRound>(() => initialSnakeRound(config));
  const [playing, setPlaying] = useState(false);

  function reset() {
    const next = initialSnakeRound(config);
    directionRef.current = next.direction;
    setRound(next);
    setPlaying(false);
    requestAnimationFrame(() => gameRef.current?.focus());
  }

  function turn(direction: SnakeDirection) {
    if (oppositeSnakeDirection[directionRef.current] === direction) return;
    directionRef.current = direction;
    setRound((current) => ({ ...current, direction }));
    gameRef.current?.focus();
  }

  useEffect(() => {
    reset();
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cell = Math.max(18, Math.floor(720 / Math.max(config.width, config.height)));
    canvas.width = config.width * cell;
    canvas.height = config.height * cell;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = config.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = config.gridColor;
    context.lineWidth = 1;
    for (let x = 0; x <= config.width; x += 1) {
      context.beginPath(); context.moveTo(x * cell + .5, 0); context.lineTo(x * cell + .5, canvas.height); context.stroke();
    }
    for (let y = 0; y <= config.height; y += 1) {
      context.beginPath(); context.moveTo(0, y * cell + .5); context.lineTo(canvas.width, y * cell + .5); context.stroke();
    }
    const drawCell = ([x, y]: SnakePoint, color: string, inset = 2) => {
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2, Math.max(3, cell * .18));
      context.fill();
    };
    drawCell(round.food, config.foodColor, Math.max(4, cell * .18));
    [...round.snake].reverse().forEach((point, index, reversed) => {
      const isHead = index === reversed.length - 1;
      drawCell(point, isHead ? config.headColor : config.snakeColor);
    });
    const [headX, headY] = round.snake[0];
    context.fillStyle = "#ffffff";
    const eye = Math.max(2, cell * .07);
    context.beginPath(); context.arc((headX + .68) * cell, (headY + .35) * cell, eye, 0, Math.PI * 2); context.fill();
    if (round.gameOver) {
      context.fillStyle = "#071f1cbb";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.textAlign = "center";
      context.font = `800 ${Math.max(24, cell * .85)}px Arial`;
      context.fillText("Spillet er slutt", canvas.width / 2, canvas.height / 2 - 10);
      context.font = `600 ${Math.max(14, cell * .42)}px Arial`;
      context.fillText(`Poeng: ${round.score}`, canvas.width / 2, canvas.height / 2 + 28);
    }
  }, [config, round]);

  useEffect(() => {
    if (!playing || round.gameOver) return;
    const interval = window.setInterval(() => {
      setRound((current) => {
        if (current.gameOver) return current;
        const direction = directionRef.current;
        const [dx, dy] = snakeVectors[direction];
        const [headX, headY] = current.snake[0];
        let nextX = headX + dx;
        let nextY = headY + dy;
        if (config.wrap) {
          nextX = (nextX + config.width) % config.width;
          nextY = (nextY + config.height) % config.height;
        }
        const hitWall = nextX < 0 || nextX >= config.width || nextY < 0 || nextY >= config.height;
        const ate = nextX === current.food[0] && nextY === current.food[1];
        const bodyToCheck = ate ? current.snake : current.snake.slice(0, -1);
        const hitSelf = bodyToCheck.some(([x, y]) => x === nextX && y === nextY);
        if (hitWall || hitSelf) {
          return { ...current, gameOver: true, message: hitWall ? "Slangen traff veggen." : "Slangen traff seg selv." };
        }
        const nextHead: SnakePoint = [nextX, nextY];
        const nextSnake = [nextHead, ...current.snake];
        if (!ate) nextSnake.pop();
        return {
          snake: nextSnake,
          food: ate ? nextSnakeFood(config.width, config.height, nextSnake) : current.food,
          direction,
          score: current.score + (ate ? 1 : 0),
          gameOver: false,
          message: ate ? "Mat! Slangen vokste med én rute." : "Spillet kjører.",
        };
      });
    }, Math.round(1000 / config.speed));
    return () => window.clearInterval(interval);
  }, [config, playing, round.gameOver]);

  useEffect(() => {
    if (round.gameOver) setPlaying(false);
  }, [round.gameOver]);

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const direction = ({ ArrowUp: "opp", ArrowDown: "ned", ArrowLeft: "venstre", ArrowRight: "hoyre" } as Record<string, SnakeDirection>)[event.key];
    if (!direction) return;
    event.preventDefault();
    turn(direction);
    if (!round.gameOver) setPlaying(true);
  }

  function saveImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${safeProjectName(config.title)}.png`;
    anchor.click();
  }

  return (
    <figure className="snake-player">
      <div className="snake-heading">
        <div><span>Python-spill</span><strong>{config.title}</strong></div>
        <div><span>Poeng</span><strong>{round.score}</strong></div>
      </div>
      <div className="snake-game" ref={gameRef} tabIndex={0} onKeyDown={handleKey} aria-label="Snake-spill. Bruk piltastene eller knappene under.">
        <canvas ref={canvasRef} className="snake-canvas" aria-label={`${config.title}, ${round.score} poeng`} />
      </div>
      <figcaption className="snake-controls">
        <div className="snake-status" aria-live="polite"><strong>{playing ? "Kjører" : round.gameOver ? "Spillet er slutt" : "Klar"}</strong><span>{round.message}</span></div>
        <div className="snake-arrows" aria-label="Styr slangen">
          <button type="button" className="snake-up" onClick={() => turn("opp")} aria-label="Opp">↑</button>
          <button type="button" onClick={() => turn("venstre")} aria-label="Venstre">←</button>
          <button type="button" onClick={() => turn("ned")} aria-label="Ned">↓</button>
          <button type="button" onClick={() => turn("hoyre")} aria-label="Høyre">→</button>
        </div>
        <div className="snake-actions">
          <button type="button" className="snake-play" onClick={() => { if (round.gameOver) reset(); else setPlaying((current) => !current); gameRef.current?.focus(); }}>{round.gameOver ? "Spill igjen" : playing ? "Pause" : "Start"}</button>
          <button type="button" onClick={reset}>Nullstill</button>
          <button type="button" onClick={onRestart}>Kjør koden på nytt</button>
          <button type="button" onClick={saveImage}>Lagre bilde</button>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const [view, setActiveView] = useState<"code"|"learn"|"pygame"|"challenge"|"exam"|"teacher"|"libraries">("code");
  const playground=view==="code", pygameView=view==="pygame", curriculumView=view==="teacher", libraryView=view==="libraries", challengeView=view==="challenge", examTrainingView=view==="exam";
  const [hydrated,setHydrated]=useState(false);
  const [lessonStep,setLessonStep]=useState(0);
  const [helpOpen,setHelpOpen]=useState(false),[helpQuery,setHelpQuery]=useState(""),[helpTopic,setHelpTopic]=useState("");
  const [workspaceTab,setWorkspaceTab]=useState("code"),[resultTab,setResultTab]=useState("output");
  const [focusMode,setFocusMode]=useState(false),[filesOpen,setFilesOpen]=useState(false),[editorShare,setEditorShare]=useState(62);
  const [saveNotice,setSaveNotice]=useState("");
  const [lastSuccessfulCode,setLastSuccessfulCode]=useState<string|null>(null);
  const [undoCode,setUndoCode]=useState<string|null>(null);
  const routeApplying=useRef(false),routeInitialized=useRef(false);
  const [fileAreas,setFileAreas]=useState<Record<string,PythonDataFile[]>>(()=>readStored("skolepython-datafiles",{}, value => !!value && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(files => Array.isArray(files) && files.every(f => f && typeof f.name === "string" && typeof f.content === "string" && typeof f.size === "number"))));

  const [activeId, setActiveId] = useState(1);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeDifficulty, setChallengeDifficulty] = useState<ChallengeDifficulty>("Alle");
  const [challengeCodes, setChallengeCodes] = useState<Record<string, string>>({});
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [challengeCheckFeedback, setChallengeCheckFeedback] = useState<string[]>([]);
  const [selectedExamTaskId, setSelectedExamTaskId] = useState<string | null>(null);
  const [examLevel, setExamLevel] = useState<ExamLevel>("Alle");
  const [examCodes, setExamCodes] = useState<Record<string, string>>({});
  const [completedExamTasks, setCompletedExamTasks] = useState<string[]>([]);
  const [examCheckFeedback, setExamCheckFeedback] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [labTab, setLabTab] = useState<"practice" | "solution">("practice");
  const [practiceCodes, setPracticeCodes] = useState<Record<number, string>>({});
  const [solutionCodes, setSolutionCodes] = useState<Record<number, string>>(
    Object.fromEntries(modules.map((module) => [module.id, module.starterCode])),
  );
  const [output, setOutput] = useState("Trykk «Kjør kode» når du er klar.");
  const [executedCode, setExecutedCode] = useState<string | null>(null);
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "loading" | "running" | "input" | "error">("idle");
  const [pythonInputRequest, setPythonInputRequest] = useState<{ prompt: string; index: number } | null>(null);
  const [pythonInputValue, setPythonInputValue] = useState("");
  const [errorCoach, setErrorCoach] = useState<ErrorCoach | null>(null);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([firstProject]);
  const [activeProjectId, setActiveProjectId] = useState(firstProject.id);
  const [shareStatus, setShareStatus] = useState("");
  const [plotImages, setPlotImages] = useState<string[]>([]);
  const [pythonVariables, setPythonVariables] = useState<PythonVariable[]>([]);
  const [variableQuery, setVariableQuery] = useState("");
  const [editorSelection, setEditorSelection] = useState({ start: 0, end: 0, selected: "" });
  const [traceSteps, setTraceSteps] = useState<PythonTraceStep[]>([]);
  const [traceIndex, setTraceIndex] = useState(0);
  const [pygameCode, setPygameCode] = useState("");
  const [pygameStatus, setPygameStatus] = useState<"loading" | "ready" | "running" | "error">("loading");
  const [pygameConsole, setPygameConsole] = useState("Pygame-motoren gjør seg klar …");
  const [pygameFrameKey, setPygameFrameKey] = useState(0);
  const [selectedPygameTutorialId, setSelectedPygameTutorialId] = useState(pygameTutorials[0].id);
  const [completedPygameTutorials, setCompletedPygameTutorials] = useState<string[]>([]);
  const [expandedPlotIndex, setExpandedPlotIndex] = useState<number | null>(null);
  const [turtleDrawing, setTurtleDrawing] = useState<TurtleDrawing | null>(null);
  const [snakeGame, setSnakeGame] = useState<SnakeGameConfig | null>(null);
  const [turtleWorkshop, setTurtleWorkshop] = useState<TurtleWorkshopSettings>(defaultTurtleWorkshop);
  const [turtleExpanded, setTurtleExpanded] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(19);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [desktopFilePath, setDesktopFilePath] = useState("");
  const [dataFileStatus, setDataFileStatus] = useState("Ingen datafiler er lagt til ennå.");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState("Forslag");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSchool, setFeedbackSchool] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const pygameFrameRef = useRef<HTMLIFrameElement | null>(null);
  const pendingPygameRunRef = useRef<{ code: string; files: { name: string; content: string }[] } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executionRef = useRef<{ code: string; files: { name: string; content: string }[]; mode: "normal" | "selection" | "trace" } | null>(null);
  const inputDialogRef = useRef<HTMLFormElement | null>(null);
  const feedbackDialogRef = useRef<HTMLElement | null>(null);
  const turtleDialogRef = useRef<HTMLDivElement | null>(null);
  const plotDialogRef = useRef<HTMLDivElement | null>(null);
  const runnerBusy = runnerStatus === "loading" || runnerStatus === "running" || runnerStatus === "input";
  const resultIsStale = executedCode !== null && code !== executedCode && !runnerBusy;
  const runButtonLabel = runnerStatus === "loading" ? "Laster Python …" : runnerStatus === "running" ? "Kjører …" : runnerStatus === "input" ? "Venter på svar …" : "Kjør kode";
  const activeLocalProject = normalizeProject(projects.find((item) => item.id === activeProjectId) ?? projects[0] ?? firstProject);
  const activePygameTutorial = pygameTutorials.find((tutorial) => tutorial.id === selectedPygameTutorialId) ?? pygameTutorials[0];
  const activeLocalFile = activeProjectFile(activeLocalProject);

  const active = useMemo(
    () => modules.find((item) => item.id === activeId) ?? modules[0],
    [activeId],
  );

  const activeChallenge = useMemo(
    () => pythonChallenges.find((challenge) => challenge.id === selectedChallengeId) ?? null,
    [selectedChallengeId],
  );

  const filteredChallenges = useMemo(
    () => pythonChallenges.filter((challenge) => challengeDifficulty === "Alle" || challenge.difficulty === challengeDifficulty),
    [challengeDifficulty],
  );

  const activeExamTask = useMemo(
    () => examTasks.find((task) => task.id === selectedExamTaskId) ?? null,
    [selectedExamTaskId],
  );

  const filteredExamTasks = useMemo(
    () => examTasks.filter((task) => examLevel === "Alle" || task.level === examLevel),
    [examLevel],
  );

  const areaKey = playground ? `code:${activeProjectId}` : pygameView ? "pygame" : challengeView ? `challenge:${selectedChallengeId}` : examTrainingView ? `exam:${selectedExamTaskId}` : `learn:${activeId}:${labTab}`;
  const dataFiles = fileAreas[areaKey] ?? [];
  function setDataFiles(change: PythonDataFile[] | ((current:PythonDataFile[])=>PythonDataFile[])) {
    setFileAreas(current=>({...current,[areaKey]:typeof change==="function"?change(current[areaKey]??[]):change}));
  }
  function readLocal(key:string) {try {return window.localStorage.getItem(key);} catch {return null;}}
  function saveLocal(key: string, value: string) {
    try { window.localStorage.setItem(key, value); setSaveNotice("Lagret på denne enheten"); }
    catch { setSaveNotice("Kunne ikke lagre. Last ned koden før du lukker siden."); }
  }
  function canAssess() { return !runnerBusy && runnerStatus === "idle" && !!code.trim() && lastSuccessfulCode === code; }
  function stopExecution() {
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
    workerRef.current?.terminate(); workerRef.current=null; executionRef.current=null;
    setRunnerStatus("idle");setPythonInputRequest(null);setLastSuccessfulCode(null);setExecutedCode(null);
    if(runnerBusy) setOutput("Kjøringen er stoppet. Du kan endre koden og prøve igjen.");
  }
  function setView(next:typeof view) {
    stopExecution();setActiveView(next);setUndoCode(null);setWorkspaceTab("code");
    setExecutedCode(null);setPythonVariables([]);setTraceSteps([]);setPlotImages([]);setTurtleDrawing(null);setSnakeGame(null);setErrorCoach(null);
    if(pygameView&&next!=="pygame"){pendingPygameRunRef.current=null;setPygameStatus("loading");setPygameFrameKey(n=>n+1);}
  }
  function focusEditor() {
    setWorkspaceTab("code");
    requestAnimationFrame(()=>document.querySelector<HTMLTextAreaElement>(".studio-editor textarea")?.focus());
  }
  function saveRoute(route:string) {
    if(!routeApplying.current && location.hash.slice(1)!==route) history.pushState(null,"",`#${route}`);
  }
  function setHelpAddress(id:string) {
    setHelpTopic(id);
    const base=location.hash.slice(1).split("?")[0]||"code";
    history.replaceState(null,"",`#${base}${id?`?help=${encodeURIComponent(id)}`:""}`);
  }
  function openHelp(query="") { setHelpQuery(query);setHelpTopic("");setHelpOpen(true);setWorkspaceTab("help");setFocusMode(false); }
  function closeHelp() {setHelpOpen(false);setHelpAddress("");focusEditor();}
  function backupCode(current:string) {
    if(!current.trim()) return;
    const backups=readStored<{area:string;code:string;at:string}[]>("skolepython-recovery",[],Array.isArray);
    if(!writeStored("skolepython-recovery",[...backups,{area:areaKey,code:current,at:new Date().toISOString()}].slice(-20))) setSaveNotice("Utkastet er i minnet. Last ned en kopi; lokal lagring er full.");
  }
  function replaceWithUndo(next:string) {
    stopExecution();const current=pygameView?pygameCode:code;backupCode(current);setUndoCode(current);
    if(pygameView)updatePygameCode(next);else {updateCode(next);seedExampleFiles(next);}
    focusEditor();
  }
  function restorePreviousDraft() {
    const backups=readStored<{area:string;code:string;at:string}[]>("skolepython-recovery",[],Array.isArray);
    const previous=backups.filter(b=>b && b.area===areaKey && typeof b.code==="string").at(-1);
    if(previous) replaceWithUndo(previous.code);
    else setShareStatus("Ingen tidligere erstatning er lagret for dette arbeidsområdet.");
  }
  function undoReplacement(){if(undoCode===null)return;const old=undoCode;setUndoCode(null);stopExecution();pygameView?updatePygameCode(old):updateCode(old);focusEditor();}
  function seedExampleFiles(source:string){const files=exampleFiles(source);if(files.length)setDataFiles(current=>[...current,...files.filter(f=>!current.some(old=>old.name===f.name))]);}
  function newHelpExample(example:HelpExample){
    if(example.environment==="pygame"){backupCode(pygameCode);choosePygame();updatePygameCode(example.code);setUndoCode(pygameCode);closeHelp();return;}
    const source=completeExample(example.id,example.code);
    const project=normalizeProject({id:crypto.randomUUID(),name:safeProjectName(`Eksempel ${example.title}`),code:source,updatedAt:new Date().toISOString()});
    const next=[...projects,project];setView("code");setProjects(next);setActiveProjectId(project.id);setCode(source);setDesktopFilePath("");
    setFileAreas(current=>({...current,[`code:${project.id}`]:exampleFiles(source)}));
    saveLocal("bjornsveen-python-active-project",project.id);
    if(!writeStored("bjornsveen-python-projects",next))setSaveNotice("Kun i minnet – last ned en kopi.");saveRoute("code");setHelpOpen(false);setOutput("Forutsi resultatet, og kjør eksemplet. Det forrige prosjektet er bevart.");focusEditor();
  }
  function insertHelpExample(example:HelpExample){
    if(directory||example.environment==="pygame"&&!pygameView){newHelpExample(example);return;}
    const editor=document.getElementById(editorId) as HTMLTextAreaElement|null;
    const current=pygameView?pygameCode:code,start=editor?.selectionStart??current.length,end=editor?.selectionEnd??start;
    const prefix=start&&!current.slice(0,start).endsWith("\n")?"\n":"",suffix=end<current.length?"\n":"";
    replaceWithUndo(current.slice(0,start)+prefix+example.code+suffix+current.slice(end));
    requestAnimationFrame(()=>{const input=document.getElementById(editorId) as HTMLTextAreaElement|null;input?.setSelectionRange(start+prefix.length+example.code.length,start+prefix.length+example.code.length);});
  }
  useEffect(()=>{
    if(!hydrated)return;
    const ok=writeStored("skolepython-module-drafts",practiceCodes)&&writeStored("skolepython-module-solutions",solutionCodes)&&writeStored("skolepython-datafiles",fileAreas);
    if(!ok)setSaveNotice("Lokal lagring er full eller utilgjengelig. Last ned en kopi.");
  },[practiceCodes,solutionCodes,fileAreas,hydrated]);
  function applyRoute(){
    routeApplying.current=true;
    const [path,query=""]=location.hash.slice(1).split("?");const [part,id]=path.split("/");
    if(part==="learn")chooseModule(modules.find(m=>m.id===Number(id))??modules[0]);
    else if(part==="challenge"){const t=pythonChallenges.find(t=>t.id===id);t?openChallenge(t):chooseChallenges();}
    else if(part==="exam"){const t=examTasks.find(t=>t.id===id);t?openExamTask(t):chooseExamTraining();}
    else if(part==="pygame")choosePygame();else if(part==="teacher")chooseCurriculum();else choosePlayground();
    const topic=new URLSearchParams(query).get("help");setHelpTopic(topic??"");setHelpOpen(!!topic);if(topic)setWorkspaceTab("help");
    routeApplying.current=false;
  }
  useEffect(()=>{
    if(!hydrated)return;
    if(!routeInitialized.current){routeInitialized.current=true;applyRoute();}
    const handler=()=>applyRoute();window.addEventListener("hashchange",handler);
    return()=>{window.removeEventListener("hashchange",handler);};
  });
  useEffect(()=>{
    const handler=(event:globalThis.KeyboardEvent)=>{
      if(event.key==="Enter"&&(event.metaKey||event.ctrlKey)&&!directory&&!pythonInputRequest&&!feedbackDialogOpen){event.preventDefault();if(pygameView){if(pygameStatus!=="running")runPygame();}else if(!runnerBusy&&code.trim())runCode();}
      if(event.key==="Escape")document.querySelectorAll<HTMLDetailsElement>(".menu[open]").forEach(menu=>menu.open=false);
      if(event.key==="Escape"&&!pythonInputRequest&&!feedbackDialogOpen&&!turtleExpanded&&expandedPlotIndex===null){if(helpOpen)closeHelp();else setFocusMode(false);}
    };
    document.addEventListener("keydown",handler);return()=>document.removeEventListener("keydown",handler);
  });
  useEffect(() => {
    const saved = readLocal("pythonverkstedet-progress");
    const savedProjects = readLocal("bjornsveen-python-projects");
    const savedPygameCode = readLocal("skolepython-pygame-code");
    const savedCompletedPygameTutorials = readLocal("skolepython-pygame-tutorials");
    const savedEditorFontSize = Number(readLocal("bjornsveen-editor-font-size"));
    const savedChallengeCodes = readLocal("skolepython-challenge-codes");
    const savedCompletedChallenges = readLocal("skolepython-completed-challenges");
    const savedExamCodes = readLocal("skolepython-exam-codes");
    const savedCompletedExamTasks = readLocal("skolepython-completed-exam-tasks");
    if (saved) setCompleted(readStored<number[]>("pythonverkstedet-progress", [], Array.isArray));
    if (savedProjects) {
      try {
        const parsed = (JSON.parse(savedProjects) as LocalProject[]).map((project) => normalizeProject(
          project.id === firstProject.id && project.code === legacyPlaygroundCode
            ? { ...project, code: "" }
            : project,
        ));
        const nextProjects = parsed.length ? parsed : [firstProject];
        const savedActive = readLocal("bjornsveen-python-active-project");
        const restored = nextProjects.find(project => project.id === savedActive) ?? nextProjects[0];
        setProjects(nextProjects);
        setActiveProjectId(restored.id);
        setCode(activeProjectFile(restored).code);

      } catch {
        setSaveNotice("Lagrede prosjekter kunne ikke leses. Originaldata er bevart.");
      }
    }
    if (savedPygameCode) setPygameCode(savedPygameCode);
    if (savedCompletedPygameTutorials) {
      setCompletedPygameTutorials(readStored("skolepython-pygame-tutorials", [], Array.isArray));
    }
    if (savedEditorFontSize >= 15 && savedEditorFontSize <= 28) setEditorFontSize(savedEditorFontSize);
    if (savedChallengeCodes) {
      setChallengeCodes(readStored("skolepython-challenge-codes", {}, isCodeMap));
    }
    if (savedCompletedChallenges) {
      setCompletedChallenges(readStored("skolepython-completed-challenges", [], Array.isArray));
    }
    if (savedExamCodes) {
      setExamCodes(readStored("skolepython-exam-codes", {}, isCodeMap));
    }
    if (savedCompletedExamTasks) {
      setCompletedExamTasks(readStored("skolepython-completed-exam-tasks", [], Array.isArray));
    }
    setPracticeCodes(readStored("skolepython-module-drafts", {}, isCodeMap));
    setSolutionCodes(current => ({...current,...readStored("skolepython-module-solutions", {}, isCodeMap)}));
    setHydrated(true);
    const handleFullscreenChange = () => setEditorFullscreen(document.fullscreenElement === workbenchRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      workerRef.current?.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function handlePygameMessage(event: MessageEvent) {
      if (event.source !== pygameFrameRef.current?.contentWindow || event.data?.source !== "skolepython-pygame") return;
      const type = String(event.data.type ?? "");
      if (type === "ready") {
        setPygameStatus("ready");
        setPygameConsole("Pygame er klar. Skriv kode eller hent startpunktet.");
        const pending = pendingPygameRunRef.current;
        if (pending) {
          pendingPygameRunRef.current = null;
          setPygameStatus("running");
          pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "run", ...pending }, "*");
        }
      } else if (type === "loading") {
        setPygameStatus("loading");
        setPygameConsole(String(event.data.message ?? "Laster Pygame …"));
      } else if (type === "stdout") {
        setPygameConsole((current) => `${current === "Kjører Pygame …" ? "" : `${current}\n`}${String(event.data.text ?? "")}`.trim());
      } else if (type === "result") {
        setPygameStatus("ready");
        setPygameConsole((current) => current.trim() || "Programmet ble avsluttet uten utskrift.");
      } else if (type === "error") {
        setPygameStatus("error");
        setPygameConsole(String(event.data.error ?? "Pygame-programmet stoppet."));
      }
    }
    window.addEventListener("message", handlePygameMessage);
    return () => window.removeEventListener("message", handlePygameMessage);
  }, [pygameFrameKey]);

  useEffect(() => {
    // Variabelvisningen beskriver alltid den koden som faktisk ble kjørt.
    // Så snart eleven endrer eller henter ny kode, skjules gamle verdier.
    setPythonVariables([]);
    setTraceSteps([]);
    setTraceIndex(0);
  }, [code]);

  useEffect(() => {
    const activeDialog = pythonInputRequest
      ? inputDialogRef.current
      : feedbackDialogOpen
        ? feedbackDialogRef.current
          : turtleExpanded
            ? turtleDialogRef.current
            : expandedPlotIndex !== null
              ? plotDialogRef.current
              : null;
    if (!activeDialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => {
      if (pythonInputRequest) {
        (activeDialog.querySelector("input") as HTMLElement | null)?.focus();
        return;
      }
      (activeDialog.querySelector(focusableSelector) as HTMLElement | null)?.focus();
    };
    requestAnimationFrame(focusFirst);

    const dialog = activeDialog;
    function handleModalKeyboard(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (pythonInputRequest) cancelPythonInput();
        else if (feedbackDialogOpen) setFeedbackDialogOpen(false);
        else if (turtleExpanded) setTurtleExpanded(false);
        else if (expandedPlotIndex !== null) setExpandedPlotIndex(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleModalKeyboard);
    return () => {
      document.removeEventListener("keydown", handleModalKeyboard);
      if (previouslyFocused?.isConnected) requestAnimationFrame(() => previouslyFocused.focus());
    };
  }, [expandedPlotIndex, feedbackDialogOpen, pythonInputRequest, turtleExpanded]);

  function changeEditorFontSize(change: number) {
    const next = Math.min(28, Math.max(15, editorFontSize + change));
    setEditorFontSize(next);
    saveLocal("bjornsveen-editor-font-size", String(next));
  }

  async function importDataFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const chosenFiles = Array.from(input.files ?? []);
    if (!chosenFiles.length) return;

    const accepted: PythonDataFile[] = [];
    const rejected: string[] = [];
    for (const file of chosenFiles) {
      if (!/\.(?:txt|csv)$/i.test(file.name)) {
        rejected.push(`${file.name} (må være .txt eller .csv)`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (større enn 5 MB)`);
        continue;
      }
      const safeName = file.name.replace(/[\\/\0]/g, "-").trim();
      accepted.push({ name: safeName, content: await file.text(), size: file.size });
    }

    if (accepted.length) {
      setDataFiles((current) => {
        const names = new Set(accepted.map((file) => file.name.toLocaleLowerCase("nb")));
        return [...current.filter((file) => !names.has(file.name.toLocaleLowerCase("nb"))), ...accepted];
      });
    }
    const success = accepted.length
      ? `${accepted.map((file) => `«${file.name}»`).join(", ")} er klar i Python.`
      : "Ingen filer ble lagt til.";
    const warning = rejected.length ? ` Ikke lagt til: ${rejected.join(", ")}.` : "";
    setDataFileStatus(`${success}${warning} Filene blir bare behandlet lokalt på denne enheten.`);
    input.value = "";
  }

  function addExampleDataFile(kind: "txt" | "csv") {
    const example = exampleDataFiles[kind];
    setDataFiles((current) => [
      ...current.filter((file) => file.name.toLocaleLowerCase("nb") !== example.name.toLocaleLowerCase("nb")),
      example,
    ]);
    setDataFileStatus(`Eksempelfilen «${example.name}» er klar. Bruk nøyaktig dette navnet i open eller read_csv.`);
  }

  function removeDataFile(name: string) {
    setDataFiles((current) => current.filter((file) => file.name !== name));
    setDataFileStatus(`«${name}» er fjernet fra Python-miljøet.`);
  }

  function dataFileShelf() {
    return (
      <div className="data-file-shelf" aria-label="Datafiler til Python-programmet">
        <div className="data-file-actions">
          <strong>Datafiler</strong>
          <label className="data-file-button">
            + Legg til .txt eller .csv
            <input type="file" accept=".txt,.csv,text/plain,text/csv" multiple onChange={importDataFiles} />
          </label>
          <button type="button" onClick={() => addExampleDataFile("txt")}>Bruk eksempel .txt</button>
          <button type="button" onClick={() => addExampleDataFile("csv")}>Bruk eksempel .csv</button>
        </div>
        {dataFiles.length > 0 && (
          <div className="data-file-list" aria-label="Filer som er klare i Python">
            {dataFiles.map((file) => (
              <span key={file.name}>
                <code>{file.name}</code>
                <small>{file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}</small>
                <button type="button" onClick={() => removeDataFile(file.name)} aria-label={`Fjern ${file.name}`}>×</button>
              </span>
            ))}
          </div>
        )}
        <p aria-live="polite">{dataFileStatus}</p>
      </div>
    );
  }

  function chooseModule(module: Module) {
    setView("learn");
    setLessonStep(0);
    saveRoute(`learn/${module.id}`);
    setActiveId(module.id);
    setLabTab("practice");
    setCode(practiceCodes[module.id] ?? "");
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePlayground() {
    requestAnimationFrame(()=>document.getElementById("playground-code")?.focus());
    saveRoute("code");
    setView("code");
    const project = projects.find((item) => item.id === activeProjectId) ?? projects[0];
    setCode(project ? activeProjectFile(project).code : playgroundCode);
    setOutput("Skriv eller endre koden, og trykk «Kjør kode».");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choosePygame() {
    saveRoute("pygame");
    setView("pygame");
    setErrorCoach(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updatePygameCode(nextCode: string) {
    setPygameCode(nextCode);
    saveLocal("skolepython-pygame-code", nextCode);
  }

  function completePygameTutorial(tutorial: PygameTutorial) {
    const nextCompleted = completedPygameTutorials.includes(tutorial.id)
      ? completedPygameTutorials
      : [...completedPygameTutorials, tutorial.id];
    setCompletedPygameTutorials(nextCompleted);
    saveLocal("skolepython-pygame-tutorials", JSON.stringify(nextCompleted));
    const nextTutorial = pygameTutorials[tutorial.step];
    if (nextTutorial) setSelectedPygameTutorialId(nextTutorial.id);
  }

  function runPygame() {
    if (!pygameCode.trim()) {
      setPygameConsole("Editoren er tom. Skriv Pygame-kode eller hent det spillbare startpunktet.");
      return;
    }
    const payload = { code: pygameCode, files: [] as { name: string; content: string }[] };
    setPygameConsole("Kjører Pygame …");
    if (pygameStatus === "ready" || pygameStatus === "error") {
      if (pygameStatus === "error") {
        pendingPygameRunRef.current = payload;
        setPygameStatus("loading");
        setPygameFrameKey((current) => current + 1);
        return;
      }
      setPygameStatus("running");
      pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "run", ...payload }, "*");
    } else {
      pendingPygameRunRef.current = payload;
      setPygameConsole("Pygame-motoren lastes. Spillet starter automatisk når den er klar …");
    }
  }

  function stopPygame() {
    pendingPygameRunRef.current = null;
    setPygameStatus("loading");
    setPygameConsole("Spillet er stoppet. Pygame-flaten nullstilles …");
    setPygameFrameKey((current) => current + 1);
  }

  function savePygameImage() {
    pygameFrameRef.current?.contentWindow?.postMessage({ source: "skolepython", type: "save-image" }, "*");
  }

  function downloadPygameCode() {
    const url = URL.createObjectURL(new Blob([pygameCode], { type: "text/x-python;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pygame-spill.py";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function chooseCurriculum() {
    saveRoute("teacher");
    setView("teacher");
    setFeedback("");
    setErrorCoach(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseChallenges() {
    saveRoute("challenge");
    setView("challenge");
    setSelectedChallengeId(null);
    setChallengeCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseExamTraining() {
    saveRoute("exam");
    setView("exam");
    setSelectedExamTaskId(null);
    setExamCheckFeedback([]);
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openExamTask(task: ExamTask) {
    saveRoute(`exam/${task.id}`);
    setView("exam");
    setSelectedExamTaskId(task.id);
    setCode(examCodes[task.id] ?? "");
    setOutput("Tolk oppgaven først. Når planen er klar, bygger og tester du programmet her.");
    setExamCheckFeedback([]);
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openChallenge(challenge: PythonChallenge) {
    saveRoute(`challenge/${challenge.id}`);
    setView("challenge");
    setSelectedChallengeId(challenge.id);
    setCode(challengeCodes[challenge.id] ?? "");
    setOutput("Skriv løsningen din, og trykk «Kjør kode» når du vil undersøke den.");
    setChallengeCheckFeedback([]);
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCode(nextCode: string) {
    setFeedback(""); setChallengeCheckFeedback([]); setExamCheckFeedback([]);
    setCode(nextCode);
    setPythonVariables([]);
    if (examTrainingView && activeExamTask) {
      const nextExamCodes = { ...examCodes, [activeExamTask.id]: nextCode };
      setExamCodes(nextExamCodes);
      saveLocal("skolepython-exam-codes", JSON.stringify(nextExamCodes));
      return;
    }
    if (challengeView && activeChallenge) {
      const nextChallengeCodes = { ...challengeCodes, [activeChallenge.id]: nextCode };
      setChallengeCodes(nextChallengeCodes);
      saveLocal("skolepython-challenge-codes", JSON.stringify(nextChallengeCodes));
      return;
    }
    if (!playground) {
      if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: nextCode }));
      else setSolutionCodes((current) => ({ ...current, [active.id]: nextCode }));
      return;
    }
    const nextProjects = projects.map((project) =>
      project.id === activeProjectId
        ? updateActiveProjectFile(project, nextCode)
        : project,
    );
    setProjects(nextProjects);
    saveLocal("bjornsveen-python-projects", JSON.stringify(nextProjects));
  }

  function composeFeedbackEmail() {
    const message = feedbackMessage.trim();
    if (!message) return;
    const context = playground ? "Python" : examTrainingView ? "Eksamenstrening" : challengeView ? "Utfordringer" : curriculumView ? "Læreplanmål" : `Modul ${active.id}: ${active.title}`;
    const subject = `Skolepython · Bjørnsveen: ${feedbackKind} – ${context}`;
    const body = [
      "Hei!",
      "",
      message,
      "",
      "---",
      `Type: ${feedbackKind}`,
      `Område: ${context}`,
      `Skole: ${feedbackSchool.trim() || "Ikke oppgitt"}`,
      `Navn: ${feedbackName.trim() || "Ikke oppgitt"}`,
      "Versjon: 0.17.0",
    ].join("\n");
    setFeedbackDialogOpen(false);
    window.location.href = `mailto:skolepython@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function switchLabTab(nextTab: "practice" | "solution") {
    if (nextTab === labTab) return;
    if (labTab === "practice") setPracticeCodes((current) => ({ ...current, [active.id]: code }));
    else setSolutionCodes((current) => ({ ...current, [active.id]: code }));
    setLabTab(nextTab);
    setCode(nextTab === "practice" ? (practiceCodes[active.id] ?? "") : (solutionCodes[active.id] ?? active.starterCode));
    setOutput("Trykk «Kjør kode» når du er klar.");
    setFeedback("");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
  }

  function checkChallengeAttempt(challenge: PythonChallenge) {
    if (!canAssess()) { setChallengeCheckFeedback(["○ Kjør hele den gjeldende koden uten feil før du ber om råd."]); return; }
    if (!code.trim()) {
      setChallengeCheckFeedback(["○ Editoren er tom ennå. Skriv ett lite steg eller hent startpunktet før du sjekker."]);
      return;
    }
    setChallengeCheckFeedback(evaluateChallengeAttempt(challenge, code, output));
  }

  function markChallengeComplete(challenge: PythonChallenge) {
    const next = completedChallenges.includes(challenge.id) ? completedChallenges : [...completedChallenges, challenge.id];
    setCompletedChallenges(next);
    saveLocal("skolepython-completed-challenges", JSON.stringify(next));
  }

  function checkExamAttempt(task: ExamTask) {
    if (!canAssess()) { setExamCheckFeedback(["○ Kjør hele den gjeldende koden uten feil før du ber om råd."]); return; }
    if (!code.trim()) {
      setExamCheckFeedback(["○ Kodefeltet er tomt. Skriv ett lite steg eller hent startpunktet først."]);
      return;
    }
    setExamCheckFeedback(evaluateExamAttempt(task, code, output));
  }

  function markExamTaskComplete(task: ExamTask) {
    const next = completedExamTasks.includes(task.id) ? completedExamTasks : [...completedExamTasks, task.id];
    setCompletedExamTasks(next);
    saveLocal("skolepython-completed-exam-tasks", JSON.stringify(next));
  }

  function selectProject(projectId: string) {
    stopExecution();
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const nextProjects = projects.map((item) => item.id === projectId ? normalized : item);
    setProjects(nextProjects);
    setActiveProjectId(projectId);
    setDesktopFilePath("");
    setCode(activeProjectFile(normalized).code);
    setOutput("Prosjektet er åpnet. Trykk «Kjør kode» når du er klar.");
    setErrorCoach(null);
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setShareStatus("");
    saveLocal("bjornsveen-python-active-project", projectId);
    saveLocal("bjornsveen-python-projects", JSON.stringify(nextProjects));
  }

  function createProject() {
    stopExecution();
    const name = window.prompt("Hva skal prosjektet hete?", `Nytt prosjekt ${projects.length + 1}`);
    if (!name?.trim()) return;
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(name),
      code: "",
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(project.code);
    setOutput("Nytt prosjekt opprettet lokalt på denne enheten.");
    setErrorCoach(null);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
    saveLocal("bjornsveen-python-active-project", project.id);
  }

  function selectProjectFile(fileId: string) {
    stopExecution();
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const file = normalized.files?.find((item) => item.id === fileId);
    if (!file) return;
    const updated = { ...normalized, activeFileId: file.id, code: file.code };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode(file.code);
    setExecutedCode(null);
    setOutput(`Filen «${file.name}» er åpnet.`);
    setErrorCoach(null);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  function createProjectFile() {
    stopExecution();
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const answer = window.prompt("Hva skal Python-filen hete?", `hjelp${normalized.files!.length}.py`);
    if (!answer?.trim()) return;
    const baseName = safeProjectName(answer.trim().replace(/\.py$/i, ""));
    const name = `${baseName}.py`;
    if (normalized.files!.some((file) => file.name.toLowerCase() === name.toLowerCase())) {
      setShareStatus(`Prosjektet har allerede en fil som heter «${name}».`);
      return;
    }
    const file: ProjectFile = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, code: "" };
    const updated: LocalProject = { ...normalized, files: [...normalized.files!, file], activeFileId: file.id, code: "", updatedAt: new Date().toISOString() };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode("");
    setExecutedCode(null);
    setOutput(`«${name}» er opprettet. Filer i samme prosjekt kan importere hverandre.`);
    setShareStatus("");
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  function renameProjectFile() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    const activeFile = activeProjectFile(normalized);
    const answer = window.prompt("Nytt filnavn:", activeFile.name);
    if (!answer?.trim()) return;
    const name = `${safeProjectName(answer.trim().replace(/\.py$/i, ""))}.py`;
    if (normalized.files!.some((file) => file.id !== activeFile.id && file.name.toLowerCase() === name.toLowerCase())) {
      setShareStatus(`Prosjektet har allerede en fil som heter «${name}».`);
      return;
    }
    const updated = { ...normalized, files: normalized.files!.map((file) => file.id === activeFile.id ? { ...file, name } : file) };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setShareStatus(`Filen heter nå «${name}».`);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  function deleteProjectFile() {
    stopExecution();
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const normalized = normalizeProject(project);
    if (normalized.files!.length === 1) {
      setShareStatus("Et prosjekt må ha minst én Python-fil.");
      return;
    }
    const activeFile = activeProjectFile(normalized);
    if (!window.confirm(`Slette filen «${activeFile.name}» fra prosjektet?`)) return;
    const files = normalized.files!.filter((file) => file.id !== activeFile.id);
    const nextFile = files[0];
    const updated = { ...normalized, files, activeFileId: nextFile.id, code: nextFile.code, updatedAt: new Date().toISOString() };
    const next = projects.map((item) => item.id === project.id ? updated : item);
    setProjects(next);
    setCode(nextFile.code);
    setExecutedCode(null);
    setOutput(`«${activeFile.name}» ble slettet. «${nextFile.name}» er åpnet.`);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  function currentProjectFiles() {
    if (!playground) return [] as { name: string; content: string }[];
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return [];
    return normalizeProject(project).files!.map((file) => ({ name: file.name, content: file.id === normalizeProject(project).activeFileId ? code : file.code }));
  }

  function renameProject() {
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project) return;
    const name = window.prompt("Nytt navn på prosjektet:", project.name);
    if (!name?.trim()) return;
    const next = projects.map((item) => item.id === project.id ? { ...item, name: safeProjectName(name) } : item);
    setProjects(next);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  function deleteProject() {
    stopExecution();
    if (projects.length === 1) {
      setShareStatus("Du må ha minst ett prosjekt.");
      return;
    }
    const project = projects.find((item) => item.id === activeProjectId);
    if (!project || !window.confirm(`Slette «${project.name}» fra denne enheten?`)) return;
    const next = projects.filter((item) => item.id !== activeProjectId);
    setProjects(next);
    setActiveProjectId(next[0].id);
    setCode(activeProjectFile(next[0]).code);
    setErrorCoach(null);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
    saveLocal("bjornsveen-python-active-project", next[0].id);
  }

  function downloadProject() {
    const project = projects.find((item) => item.id === activeProjectId) ?? firstProject;
    const file = activeProjectFile(project);
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function openDesktopProject() {
    const opened = await window.bjornsveenDesktop?.openProject();
    if (!opened) return;
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: opened.name,
      code: opened.code,
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath(opened.filePath);
    setCode(opened.code);
    setOutput("Prosjektet er åpnet fra Mac-en.");
    setErrorCoach(null);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
  }

  async function saveDesktopProject(saveAs = false) {
    const project = projects.find((item) => item.id === activeProjectId) ?? firstProject;
    const saved = await window.bjornsveenDesktop?.saveProject({
      filePath: saveAs ? undefined : desktopFilePath || undefined,
      name: project.name,
      code,
    });
    if (!saved) return;
    setDesktopFilePath(saved.filePath);
    const next = projects.map((item) => item.id === activeProjectId ? { ...item, name: saved.name } : item);
    setProjects(next);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
    setShareStatus("Prosjektet er lagret som en vanlig .py-fil på Mac-en.");
  }

  async function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const importedCode = await file.text();
    const project = normalizeProject({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: safeProjectName(file.name.replace(/\.py$/i, "")),
      code: importedCode,
      updatedAt: new Date().toISOString(),
    });
    const next = [...projects, project];
    setProjects(next);
    setActiveProjectId(project.id);
    setDesktopFilePath("");
    setCode(importedCode);
    setOutput("Python-filen er importert som et lokalt prosjekt.");
    setErrorCoach(null);
    saveLocal("bjornsveen-python-projects", JSON.stringify(next));
    saveLocal("bjornsveen-python-active-project", project.id);
    event.target.value = "";
  }

  async function copyCodeAsText() {
    const answer = output.trim() || "Ingen utskrift ennå.";
    const plainText = `Python-kode:\n${code || "(tom editor)"}\n\nSvar / resultat:\n${answer}`;
    try {
      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const html = `<div style="font-family: ui-monospace, SFMono-Regular, Consolas, monospace;"><h3>Python-kode</h3><pre style="white-space: pre-wrap; background: #102e2b; color: #eef5ef; padding: 16px; border-radius: 8px;"><code>${escape(code || "(tom editor)")}</code></pre><h3>Svar / resultat</h3><pre style="white-space: pre-wrap; background: #f4f4f4; padding: 16px; border-radius: 8px;">${escape(answer)}</pre></div>`;
        await navigator.clipboard.write([new ClipboardItem({
          "text/plain": new Blob([plainText], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setShareStatus("Koden og svaret er kopiert som formatert tekst.");
    } catch {
      setShareStatus("Nettleseren tillot ikke kopiering. Marker koden og kopier manuelt.");
    }
  }

  async function copyCodeAsImage(filename: string) {
    const lines = (code || "(tom editor)").replace(/\t/g, "    ").split("\n");
    const answerLines = (output.trim() || "Ingen utskrift ennå.").split("\n");
    const fontSize = 20;
    const lineHeight = 31;
    const padding = 34;
    const titleHeight = 58;
    const canvas = document.createElement("canvas");
    const measure = canvas.getContext("2d");
    if (!measure) return;
    measure.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    const width = Math.min(1800, Math.max(720, ...[...lines, ...answerLines].map((line) => measure.measureText(line).width + padding * 2)));
    const visualSources = plotImages.map((plotImage) => `data:image/png;base64,${plotImage}`);
    const snakeCanvas = document.querySelector<HTMLCanvasElement>(".snake-canvas");
    if (snakeGame && snakeCanvas) visualSources.unshift(snakeCanvas.toDataURL("image/png"));
    if (turtleDrawing) {
      const turtleCanvas = document.createElement("canvas");
      renderTurtleFrame(turtleCanvas, turtleDrawing, turtleDrawing.events.length, turtleWorkshop);
      visualSources.unshift(turtleCanvas.toDataURL("image/png"));
    }
    const plots = await Promise.all(visualSources.map(async (plotSource) => {
      const plot = new Image();
      plot.src = plotSource;
      await plot.decode();
      return plot;
    }));
    const codeHeight = padding + lines.length * lineHeight + padding;
    const answerHeaderHeight = 48;
    const answerHeight = padding + answerLines.length * lineHeight + padding;
    const plotHeights = plots.map((plot) => Math.min(430, (plot.height / plot.width) * (width - padding * 2)));
    const plotHeight = plotHeights.reduce((sum, item) => sum + item + padding, 0);
    const height = Math.max(320, titleHeight + codeHeight + answerHeaderHeight + answerHeight + plotHeight);
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(2, 2);
    context.fillStyle = "#102e2b";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#183a36";
    context.fillRect(0, 0, width, titleHeight);
    context.fillStyle = "#f06f51";
    context.beginPath(); context.arc(25, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#f4c95d";
    context.beginPath(); context.arc(45, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#6fd79f";
    context.beginPath(); context.arc(65, 29, 6, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#d9e8df";
    context.font = "700 14px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText(filename, 92, 34);
    context.fillStyle = "#e7eee9";
    context.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    lines.forEach((line, index) => context.fillText(line, padding, titleHeight + padding + (index + 1) * lineHeight));
    const answerTop = titleHeight + codeHeight;
    context.fillStyle = "#234b46";
    context.fillRect(0, answerTop, width, answerHeaderHeight);
    context.fillStyle = "#9fe5bd";
    context.font = "700 15px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("SVAR / RESULTAT", padding, answerTop + 31);
    context.fillStyle = "#0c2421";
    context.fillRect(0, answerTop + answerHeaderHeight, width, answerHeight + plotHeight);
    context.fillStyle = "#e7eee9";
    context.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    answerLines.forEach((line, index) => context.fillText(line, padding, answerTop + answerHeaderHeight + padding + (index + 1) * lineHeight));
    let nextPlotTop = answerTop + answerHeaderHeight + answerHeight;
    plots.forEach((plot, index) => {
      const drawWidth = width - padding * 2;
      const drawHeight = plotHeights[index];
      context.drawImage(plot, padding, nextPlotTop, drawWidth, drawHeight);
      nextPlotTop += drawHeight + padding;
    });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setShareStatus("Hele kodeeditoren og svaret er kopiert som bilde.");
    } catch {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${filename.replace(/\.py$/, "")}-kode.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setShareStatus("Bildet ble lastet ned fordi nettleseren ikke tillot bildekopiering.");
    }
  }

  function downloadPlot(index: number) {
    const plotImage = plotImages[index];
    if (!plotImage) return;
    const activeProject = projects.find((item) => item.id === activeProjectId);
    const baseName = playground ? safeProjectName(activeProject?.name ?? "python-graf") : `modul-${active.id}-graf`;
    const anchor = document.createElement("a");
    anchor.href = `data:image/png;base64,${plotImage}`;
    anchor.download = `${baseName}${plotImages.length > 1 ? `-${index + 1}` : ""}.png`;
    anchor.click();
    setShareStatus("Grafen er lagret som PNG-bilde.");
  }

  function turtleBaseName() {
    const activeProject = projects.find((item) => item.id === activeProjectId);
    return playground ? safeProjectName(activeProject?.name ?? "turtle-tegning") : `modul-${active.id}-turtle`;
  }

  function downloadTurtle(settings: TurtleWorkshopSettings) {
    if (!turtleDrawing) return;
    const canvas = document.createElement("canvas");
    renderTurtleFrame(canvas, turtleDrawing, turtleDrawing.events.length, settings);
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${turtleBaseName()}.png`;
    anchor.click();
    setShareStatus("Turtle-forhåndsvisningen er lagret som et skarpt PNG-bilde.");
  }

  function downloadTurtleSvg(settings: TurtleWorkshopSettings) {
    if (!turtleDrawing) return;
    const svg = createTurtleSvg(turtleDrawing, settings);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${turtleBaseName()}-${settings.mode}.svg`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    const modeNames: Record<TurtleVectorMode, string> = { centerline: "senterlinje", edges: "to ytterlinjer", outline: "lukket omriss" };
    setShareStatus(`SVG med ${modeNames[settings.mode]} er lagret i riktig millimeterstørrelse.`);
  }

  function focusErrorLine(lineNumber: number) {
    setWorkspaceTab("code");
    const editorId = examTrainingView ? "exam-code" : challengeView ? "challenge-code" : playground ? "playground-code" : "python-code";
    const input = document.getElementById(editorId) as HTMLTextAreaElement | null;
    if (!input) return;
    const lines = code.split("\n");
    const lineIndex = Math.max(0, Math.min(lines.length - 1, lineNumber - 1));
    const start = lines.slice(0, lineIndex).reduce((sum, line) => sum + line.length + 1, 0);
    const end = start + (lines[lineIndex]?.length ?? 0);
    input.focus();
    input.setSelectionRange(start, end);
    const lineHeight = Number.parseFloat(window.getComputedStyle(input).lineHeight) || 30;
    input.scrollTop = Math.max(0, (lineIndex - 3) * lineHeight);
  }

  function errorCoachPanel() {
    if (!errorCoach) return null;
    return (
      <section className={`error-coach is-${errorCoach.kind}`} aria-labelledby="error-coach-title">
        <header className="error-coach-heading">
          <div>
            <span className="error-coach-label">Feildetektiv</span>
            <h3 id="error-coach-title">{errorCoach.title}</h3>
          </div>
          {errorCoach.lineNumber && (
            <button type="button" onClick={() => focusErrorLine(errorCoach.lineNumber!)}>
              Gå til linje {errorCoach.lineNumber}
            </button>
          )}
        </header>
        <p className="error-coach-summary">{errorCoach.summary}</p>
        {errorCoach.lineNumber && (
          <div className="error-code-line" aria-label={`Kode på linje ${errorCoach.lineNumber}`}>
            <span>{errorCoach.lineNumber}</span>
            <code>{errorCoach.codeLine || "(tom linje)"}</code>
          </div>
        )}
        <div className="error-coach-questions">
          <strong>Undersøk før du endrer</strong>
          <ol>{errorCoach.questions.map((question) => <li key={question}>{question}</li>)}</ol>
        </div>
        <details className="error-hint">
          <summary>Vis et tydeligere hint</summary>
          <p>{errorCoach.hint}</p>
        </details>
        <details className="error-technical">
          <summary>Vis den tekniske Python-feilen</summary>
          <pre>{errorCoach.technical}</pre>
        </details>
        <p className="error-coach-next"><strong>Neste steg:</strong> Endre én liten ting, og kjør koden på nytt.</p>
      </section>
    );
  }

  function plotGallery() {
    if (!plotImages.length && !turtleDrawing && !snakeGame) return null;
    return (
      <div className={`plot-gallery ${turtleDrawing ? "has-turtle" : ""} ${snakeGame ? "has-game" : ""}`} aria-label={snakeGame ? "Python-spill og andre resultater" : turtleDrawing ? "Turtle-tegning og grafer" : plotImages.length === 1 ? "Graf" : `${plotImages.length} grafer`}>
        {snakeGame && <SnakePlayer config={snakeGame} onRestart={runCode} />}
        {turtleDrawing && (
          <TurtlePlayer
            drawing={turtleDrawing}
            settings={turtleWorkshop}
            onSettingsChange={setTurtleWorkshop}
            onDownload={downloadTurtle}
            onDownloadSvg={downloadTurtleSvg}
            onExpand={() => setTurtleExpanded(true)}
          />
        )}
        {plotImages.map((plotImage, index) => (
          <figure className="plot-card" key={`${index}-${plotImage.slice(0, 18)}`}>
            <img className="plot-output" src={`data:image/png;base64,${plotImage}`} alt={`Graf ${index + 1} laget av Python-koden`} />
            <figcaption>
              <span>{plotImages.length === 1 ? "Graf" : `Graf ${index + 1}`}</span>
              <span className="plot-actions">
                <button type="button" onClick={() => setExpandedPlotIndex(index)}>Åpne stort</button>
                <button type="button" onClick={() => downloadPlot(index)}>Lagre bilde</button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  function variableInspector() {
    if (!pythonVariables.length) return null;
    const typeNames: Record<string, string> = {
      int: "heltall",
      float: "desimaltall",
      str: "tekst",
      bool: "sann/usann",
      list: "liste",
      tuple: "tuppel",
      dict: "ordbok",
      set: "mengde",
      ndarray: "NumPy-tabell",
      DataFrame: "tabell",
      Series: "kolonne",
    };
    const normalizedQuery = normalizeCommandSearch(variableQuery);
    const visibleVariables = pythonVariables.filter((variable) => normalizeCommandSearch(`${variable.name} ${variable.type} ${variable.value}`).includes(normalizedQuery));
    return (
      <section className="variable-inspector" aria-label="Variabler etter kjøring">
        <div className="variable-inspector-heading">
          <div><span>Etter kjøring</span><strong>Dette husker Python nå</strong></div>
          <small>{pythonVariables.length} {pythonVariables.length === 1 ? "variabel" : "variabler"}</small>
        </div>
        {pythonVariables.length > 5 && (
          <label className="variable-search"><span>Søk i variablene</span><input type="search" value={variableQuery} onChange={(event) => setVariableQuery(event.target.value)} placeholder="navn, type eller verdi" /></label>
        )}
        <div className="variable-table-wrap">
          <table>
            <thead><tr><th>Navn</th><th>Type</th><th>Størrelse</th><th>Siste verdi</th></tr></thead>
            <tbody>
              {visibleVariables.map((variable) => (
                <tr key={variable.name}>
                  <th scope="row"><code>{variable.name}</code></th>
                  <td>{typeNames[variable.type] ?? variable.type}</td>
                  <td>{variable.shape || variable.size || "én verdi"}</td>
                  <td><code>{variable.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Størrelse viser antall elementer eller formen på en tabell. Løkkevariabler viser den siste verdien de fikk.</p>
      </section>
    );
  }

  function tracePlayer() {
    if (!traceSteps.length) return null;
    const safeIndex = Math.min(traceIndex, traceSteps.length - 1);
    const step = traceSteps[safeIndex];
    return (
      <section className="trace-player" aria-label="Stegvis kjøring">
        <div className="trace-heading">
          <div><span>Følg programmet</span><strong>Steg {safeIndex + 1} av {traceSteps.length}</strong></div>
          <div className="trace-controls">
            <button type="button" onClick={() => setTraceIndex(0)} disabled={safeIndex === 0}>Første</button>
            <button type="button" onClick={() => setTraceIndex((current) => Math.max(0, current - 1))} disabled={safeIndex === 0}>← Forrige</button>
            <button type="button" onClick={() => setTraceIndex((current) => Math.min(traceSteps.length - 1, current + 1))} disabled={safeIndex === traceSteps.length - 1}>Neste →</button>
          </div>
        </div>
        <div className="trace-code-line"><span>{step.line}</span><code>{step.code || "(tom linje)"}</code></div>
        <p>Python står foran denne linjen. Tabellen viser verdiene som finnes akkurat nå.</p>
        {step.variables.length ? (
          <div className="trace-variables">
            {step.variables.map((variable) => <div key={variable.name}><code>{variable.name}</code><span>{variable.value}</span></div>)}
          </div>
        ) : <div className="trace-empty">Ingen egne variabler er laget ennå.</div>}
      </section>
    );
  }

  function makeWorker() {
    workerRef.current?.terminate();
    const worker = new Worker(new URL("pyodide-worker.mjs", document.baseURI), {
      type: "module",
    });
    workerRef.current = worker;
    return worker;
  }

  function armExecutionTimeout(worker: Worker) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      executionRef.current = null;
      setPythonInputRequest(null);
      setRunnerStatus("error");
      setOutput("Programmet brukte for lang tid og ble stoppet. Sjekk særlig løkker som kanskje aldri avsluttes.");
    }, playground ? 90000 : challengeView || examTrainingView ? 30000 : 8000);
  }

  function submitPythonInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const worker = workerRef.current;
    const execution = executionRef.current;
    if (!worker || !execution || !pythonInputRequest) return;
    const answer = pythonInputValue;
    setPythonInputRequest(null);
    setPythonInputValue("");
    setRunnerStatus("running");
    setOutput(`Svaret er sendt til Python. Programmet fortsetter fra samme sted …`);
    worker.postMessage({ type: "input-response", value: answer });
    armExecutionTimeout(worker);
  }

  function cancelPythonInput() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    executionRef.current = null;
    setPythonInputRequest(null);
    setPythonInputValue("");
    setRunnerStatus("idle");
    setOutput("Kjøringen ble stoppet mens programmet ventet på et svar.");
  }

  function runCode() {
    void executeCode(code, "normal");
  }

  function runSelectedCode() {
    const editor = document.getElementById(editorId) as HTMLTextAreaElement | null;
    const liveSelection = editor ? editor.value.slice(editor.selectionStart, editor.selectionEnd) : editorSelection.selected;
    const selected = liveSelection.trim();
    if (!selected) {
      setOutput("Marker én eller flere hele kodelinjer først. Deretter kan du kjøre bare det markerte området.");
      return;
    }
    void executeCode(liveSelection, "selection");
  }

  function runTrace() {
    if (!code.trim()) {
      setOutput("Skriv litt kode før du følger den steg for steg.");
      return;
    }
    void executeCode(code, "trace");
  }

  async function executeCode(sourceCode: string, mode: "normal" | "selection" | "trace") {
    setLastSuccessfulCode(null);
    setExecutedCode(code);
    setResultTab(mode === "trace" ? "trace" : "output");
    setWorkspaceTab("result");
    setRunnerStatus("loading");
    setOutput(mode === "selection" ? "Kjører bare den markerte koden …" : mode === "trace" ? "Python lager en stegvis gjennomgang …" : "Starter Python … Første kjøring kan ta litt tid.");
    setPythonVariables([]);
    setTraceSteps([]);
    setTraceIndex(0);
    setErrorCoach(null);
    setFeedback("");
    setPlotImages([]);
    setExpandedPlotIndex(null);
    setTurtleDrawing(null);
    setTurtleExpanded(false);
    setSnakeGame(null);
    setPythonInputRequest(null);
    setPythonInputValue("");

    const worker = makeWorker();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current !== worker) return;
      worker.terminate(); workerRef.current = null; executionRef.current = null;
      setRunnerStatus("error");
      setOutput("Python ble ikke klar innen to minutter. Kontroller forbindelsen og prøv igjen.");
    }, 120000);
    executionRef.current = {
      code: sourceCode,
      files: [
        ...dataFiles.map(({ name, content }) => ({ name, content })),
        ...currentProjectFiles(),
      ],
      mode,
    };
    let executionStarted = false;

    worker.onmessage = (event) => {
      if (workerRef.current !== worker) return;
      const data = event.data as { type: string; output?: string; error?: string; prompt?: string; index?: number; plots?: string[]; turtle?: TurtleDrawing | null; game?: SnakeGameConfig | null; variables?: PythonVariable[]; trace?: PythonTraceStep[] };
      if (data.type === "ready") {
        executionStarted = true;
        setRunnerStatus("running");
        setOutput(dataFiles.length ? `Kjører med ${dataFiles.length} datafil${dataFiles.length === 1 ? "" : "er"} …` : "Kjører …");
        worker.postMessage({ type: "run", ...executionRef.current });
        armExecutionTimeout(worker);
      }

      if (data.type === "input") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const execution = executionRef.current;
        if (!execution || (data.index ?? 0) >= 20) {
          worker.terminate();
          workerRef.current = null;
          executionRef.current = null;
          setRunnerStatus("error");
          setOutput("Programmet ba om mer enn 20 svar og ble stoppet. Sjekk om input() ligger i en løkke som aldri avsluttes.");
          return;
        }
        const prompt = data.prompt?.trim() || "Skriv et svar:";
        setRunnerStatus("input");
        setPythonInputValue("");
        setPythonInputRequest({ prompt, index: data.index ?? 0 });
        const partialOutput = data.output?.trim();
        setOutput(partialOutput ? `${partialOutput}\n\nProgrammet venter nå på et svar.` : `Programmet spør: ${prompt}`);
      }

      if (data.type === "result") {
        if (mode === "normal") setLastSuccessfulCode(sourceCode);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("idle");
        setErrorCoach(null);
        const nextPlots = data.plots ?? [];
        const nextTurtle = data.turtle ?? null;
        const nextGame = data.game ?? null;
        setOutput(data.output?.trim() || (nextGame ? "Snake-spillet er klart. Trykk Start og bruk piltastene." : nextTurtle ? "Turtle-tegningen kan spilles av steg for steg under." : nextPlots.length ? `${nextPlots.length === 1 ? "Grafen" : `${nextPlots.length} grafer`} vises under.` : "Koden kjørte ferdig uten utskrift."));
        setPlotImages(nextPlots);
        setPythonVariables(data.variables ?? []);
        setTraceSteps(data.trace ?? []);
        setTraceIndex(0);
        setTurtleDrawing(nextTurtle);
        setSnakeGame(nextGame);
        worker.terminate();
        workerRef.current = null;
        executionRef.current = null;
        setPythonInputRequest(null);
      }

      if (data.type === "error") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRunnerStatus("error");
        const error = data.error || "Python stoppet uten en teknisk feilmelding.";
        setErrorCoach(analyzePythonError(error, sourceCode));
        setPythonVariables([]);
        setOutput("Python trenger litt hjelp før programmet kan kjøre ferdig.");
        worker.terminate();
        workerRef.current = null;
        executionRef.current = null;
        setPythonInputRequest(null);
      }
    };

    worker.onerror = (event) => {
      if (workerRef.current !== worker) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRunnerStatus("error");
      setErrorCoach(null);
      setPythonVariables([]);
      const detail = event.message ? ` Teknisk detalj: ${event.message}` : "";
      setOutput(
        executionStarted
          ? `Python-motoren stoppet. Prøv å kjøre på nytt.${detail}`
          : `Kunne ikke laste Python-motoren. Sjekk nettilkoblingen og prøv igjen.${detail}`,
      );
      worker.terminate();
      workerRef.current = null;
      executionRef.current = null;
      setPythonInputRequest(null);
    };
  }

  function checkAnswer() {
    if (!canAssess()) { setFeedback("Kjør hele den gjeldende koden uten feil først. Et gammelt resultat kan ikke vurderes."); return; }
    const values = output.match(/-?\d+(?:[.,]\d+)?/g)?.map(x => Number(x.replace(",", "."))) ?? [];
    const expected: Record<number, number[]> = {1:[560], 3:[3,6,9,12,15], 4:[16], 6:[1157.625]};
    let message = "Kjøringen er ferdig. Kontroller kravene i oppgaven, prøv flere verdier og forklar løsningen. Dette er egenvurdering.";
    if (expected[active.id]) {
      const ok = expected[active.id].every(n=>values.some(value=>Math.abs(value-n)<0.011));
      message = ok ? "Resultatet inneholder de forventede tallene. Det beviser ikke at programmet er generelt: prøv kontrolltilfellene og forklar beregningen." : `Resultatet stemmer ikke med tallene i oppgaven ennå. ${active.taskHint}`;
    } else if (active.id === 2) message = /\boddetall\b/i.test(output) ? "Utskriften sier oddetall. Test også 0, 18 og −3, og forklar hvilken gren som velges." : "For 37 skal programmet velge oddetall. Undersøk divisjonsresten.";
    else if (active.id === 5) message = "En simulering har ikke én eksakt fasit. Kontroller at både 1 og 2 telles, at andelen er mellom 0 og 1, og kjør flere ganger. Sammenlign med 1/3.";
    else if (active.id === 7) message = turtleDrawing ? "Tegningen er laget. Tell åtte sider og kontroller 45° sving, lukking og like sidelengder. Dette vurderer du i figuren." : "Ingen Turtle-tegning ble laget. Undersøk importen og tegneløkken.";
    else if (active.id === 8) message = snakeGame ? "Spillet er klart. Test fart, farger og begge veggreglene; begrunn valgene dine." : "Ingen Snake-spillflate ble laget. Kontroller spill.start().";
    else if (active.id === 9) message = plotImages.length ? "Grafen er laget. Kontroller (0, 6), (2, 0) og (4, −6), aksetitler og utsnitt. En graf alene godkjenner ikke funksjonen." : "Ingen graf ble laget. Kontroller plt.show() og eventuelle feilmeldinger.";
    else if (active.id === 10) message = /gjennomsnitt/i.test(output) && /varmest/i.test(output) ? "Begge resultatene er omtalt. Kontroller gjennomsnittet og varmeste dag mot selve CSV-dataene, og prøv et nytt datasett." : "Vis både gjennomsnittet og hvilken dag som var varmest. Kontroller kolonnenavn og tallkonvertering.";
    setFeedback(message);
  }

  function completeModule() {
    const next = completed.includes(active.id) ? completed : [...completed, active.id];
    setCompleted(next);
    saveLocal("pythonverkstedet-progress", JSON.stringify(next));
  }

  const editorId = pygameView ? "pygame-code" : examTrainingView ? "exam-code" : challengeView ? "challenge-code" : playground ? "playground-code" : "python-code";
  const hasTask = view === "learn" || pygameView || !!(challengeView && activeChallenge) || !!(examTrainingView && activeExamTask);
  const directory = curriculumView || (challengeView && !activeChallenge) || (examTrainingView && !activeExamTask);
  return (
    <main className={`studio ${focusMode ? "is-focused" : ""}`}>
      <a className="skip-link" href={`#${editorId}`} onClick={()=>focusEditor()}>Til koden</a>
      <header className="studio-header">
        <a className="studio-brand" href="#code" onClick={e=>{e.preventDefault();choosePlayground();}} aria-label="Skolepython – åpne kode"><img src="./brand/kodeormen-256.png" width="34" height="34" alt=""/><span>Skolepython<small>Fra Bjørnsveen</small></span></a>
        <nav aria-label="Hovedområder" className="studio-nav">
          <a href="#code" aria-current={playground?"page":undefined} onClick={e=>{e.preventDefault();choosePlayground();}}>〈/〉 Kode</a>
          <a href={`#learn/${activeId}`} aria-current={view==="learn"||pygameView?"page":undefined} onClick={e=>{e.preventDefault();chooseModule(active);}}>Lær</a>
          <a href="#challenge" aria-current={challengeView||examTrainingView?"page":undefined} onClick={e=>{e.preventDefault();chooseChallenges();}}>Øv</a>
          <a href="#teacher" aria-current={curriculumView?"page":undefined} onClick={e=>{e.preventDefault();chooseCurriculum();}}>Lærer</a>
        </nav>
        <div className="header-actions"><button onClick={()=>openHelp()} aria-expanded={helpOpen}>? Hjelp</button><details className="menu" onClick={e=>{if((e.target as HTMLElement).closest("button"))e.currentTarget.open=false;}}><summary aria-label="Appmeny">•••</summary><div><button onClick={()=>setFeedbackDialogOpen(true)}>Gi tilbakemelding</button><button onClick={()=>window.print()}>Skriv ut hefte</button><button onClick={()=>setFocusMode(!focusMode)}>{focusMode?"Avslutt fokusvisning":"Fokusvisning"}</button><small>Skolepython 0.17.1 · Arbeid lagres på denne enheten.</small></div></details></div>
      </header>
      {!directory && <div className="workspace-context">
        {playground ? <><label>Prosjekt<select aria-label="Åpent prosjekt" value={activeProjectId} onChange={e=>{stopExecution();selectProject(e.target.value);}}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button onClick={createProject}>+ Nytt prosjekt</button></> : view==="learn" ? <label>Modul<select aria-label="Velg modul" value={activeId} onChange={e=>chooseModule(modules.find(m=>m.id===Number(e.target.value))!)}>{learningOrder.map(id=>{const m=modules.find(m=>m.id===id)!;return <option key={id} value={id}>{completed.includes(id)?"✓ ":""}{id}. {m.shortTitle}</option>})}</select></label> : <strong>{pygameView ? "Pygame · Fang mynten" : activeChallenge?.title || activeExamTask?.title}</strong>}
        <div className="context-end"><label>Miljø<select aria-label="Python-miljø" value={pygameView?"pygame":"python"} onChange={e=>e.target.value==="pygame"?choosePygame():choosePlayground()}><option value="python">Python</option><option value="pygame">Pygame</option></select></label><span className="save-state" role="status">{saveNotice || "✓ Lagret lokalt"}</span></div>
      </div>}
      {directory ? <>
        {curriculumView ? <Suspense fallback={<p>Laster lærerveiledning …</p>}><TeacherView onModule={id=>chooseModule(modules.find(m=>m.id===id)!)} /></Suspense> : <section className="directory"><header><small>LES · BYGG · FORKLAR</small><h1>{examTrainingView?"Eksamenstrening":"Utfordringer"}</h1><p>{examTrainingView?"Egenproduserte øvingsoppgaver med kodeforståelse og matematisk forklaring.":"Velg et oppdrag. Ta ett hint om gangen, og test ideen din i Python."}</p><div className="button-row"><button aria-pressed={challengeView} onClick={chooseChallenges}>Utfordringer</button><button aria-pressed={examTrainingView} onClick={chooseExamTraining}>Eksamenstrening</button><label>Nivå<select aria-label="Filtrer nivå" value={examTrainingView?examLevel:challengeDifficulty} onChange={e=>examTrainingView?setExamLevel(e.target.value as ExamLevel):setChallengeDifficulty(e.target.value as ChallengeDifficulty)}>{(examTrainingView?examLevels:challengeDifficulties).map(level=><option key={level}>{level}</option>)}</select></label></div></header><div className="directory-grid">{examTrainingView ? filteredExamTasks.map(t=><button className="task-card" key={t.id} onClick={()=>openExamTask(t)}><small>{t.level} · {t.estimatedMinutes} min {completedExamTasks.includes(t.id)?"· ✓ Fullført":""}</small><h2>{t.title}</h2><p>{t.shortDescription}</p><span>Åpne oppgaven →</span></button>) : filteredChallenges.map(t=><button className="task-card" key={t.id} onClick={()=>openChallenge(t)}><small>{t.difficulty} · {t.estimatedMinutes} min {completedChallenges.includes(t.id)?"· ✓ Fullført":""}</small><h2>{t.title}</h2><p>{t.teaser}</p><span>Åpne utfordringen →</span></button>)}</div></section>}
        {helpOpen&&<div className="directory-help"><Suspense fallback={<p>Laster hjelp …</p>}><HelpPanel initialQuery={helpQuery} initialTopic={helpTopic} onTopic={setHelpAddress} onClose={closeHelp} onInsert={insertHelpExample} onExample={newHelpExample}/></Suspense></div>}
      </> : <>
        <nav className="workspace-tabs" aria-label="Vis arbeidsfelt">{hasTask&&<button aria-pressed={workspaceTab==="lesson"} onClick={()=>setWorkspaceTab("lesson")}>Oppgave</button>}<button aria-pressed={workspaceTab==="code"} onClick={()=>focusEditor()}>Kode</button><button aria-pressed={workspaceTab==="result"} onClick={()=>setWorkspaceTab("result")}>Resultat{runnerStatus==="error"?" !":""}</button><button aria-pressed={workspaceTab==="help"} onClick={()=>openHelp()}>Hjelp</button></nav>
        <div className={`studio-workspace ${hasTask?"with-lesson":""} ${helpOpen?"with-help":""} tab-${workspaceTab}`} style={{"--editor-share":`${editorShare}%`} as CSSProperties} ref={workbenchRef}>
          {view==="learn" && <LessonPanel key={active.id} module={active} step={lessonStep} onStep={setLessonStep} onTry={replaceWithUndo} onCheck={checkAnswer} onComplete={completeModule} completed={completed.includes(active.id)} feedback={feedback} onHelp={openHelp} onPygame={choosePygame}/>}
          {challengeView&&activeChallenge&&<PracticePanel key={activeChallenge.id} challenge={activeChallenge} onTry={replaceWithUndo} onCheck={()=>checkChallengeAttempt(activeChallenge)} onComplete={()=>markChallengeComplete(activeChallenge)} completed={completedChallenges.includes(activeChallenge.id)} feedback={challengeCheckFeedback} onBack={chooseChallenges}/>}
          {examTrainingView&&activeExamTask&&<PracticePanel key={activeExamTask.id} exam={activeExamTask} onTry={replaceWithUndo} onCheck={()=>checkExamAttempt(activeExamTask)} onComplete={()=>markExamTaskComplete(activeExamTask)} completed={completedExamTasks.includes(activeExamTask.id)} feedback={examCheckFeedback} onBack={chooseExamTraining}/>}
          {pygameView&&<aside className="lesson-panel"><div className="lesson-title"><small>PYGAME-KURSET · 6 STEG</small><h1>Fang mynten</h1><label>Velg steg<select value={selectedPygameTutorialId} onChange={e=>setSelectedPygameTutorialId(e.target.value)}>{pygameTutorials.map(t=><option key={t.id} value={t.id}>{t.step}. {t.shortTitle}{completedPygameTutorials.includes(t.id)?" ✓":""}</option>)}</select></label></div><div className="lesson-body"><h2>{activePygameTutorial.title}</h2><p>{activePygameTutorial.goal}</p><p>{activePygameTutorial.explanation}</p><h3>Nytt i dette steget</h3>{activePygameTutorial.newIdeas.map(t=><div className="small-example" key={t.code}><code>{t.code}</code><p>{t.explanation}</p></div>)}<button className="primary" onClick={()=>replaceWithUndo(activePygameTutorial.code)}>Prøv steg {activePygameTutorial.step}</button><details><summary>Se hele programmet</summary><pre><code>{activePygameTutorial.code}</code></pre></details><h3>Observer og forklar</h3><ol>{activePygameTutorial.observe.map(t=><li key={t}>{t}</li>)}</ol><h3>Prøv en endring</h3><ul>{activePygameTutorial.experiments.map(t=><li key={t}>{t}</li>)}</ul><button onClick={()=>completePygameTutorial(activePygameTutorial)}>Jeg har testet og forklart</button></div></aside>}
          <div className="coding-area">
            <section className="editor-panel studio-editor" aria-label="Kodeflate">
              <div className="workspace-toolbar"><div className="run-actions"><button className="run-button" onClick={pygameView?runPygame:runCode} disabled={pygameView?pygameStatus==="running":runnerBusy||!code.trim()}><span aria-hidden="true">▶</span>{pygameView?pygameStatus==="running"?"Spillet kjører":"Start spillet":runButtonLabel}</button>{(runnerBusy||pygameView)&&<button className="stop-button" onClick={pygameView?stopPygame:stopExecution}>■ Stopp</button>}<small className="shortcut">Ctrl/⌘ Enter</small></div><div className="editor-actions"><button onClick={()=>openHelp()} aria-expanded={helpOpen}>? Hjelp</button><button onClick={()=>setFocusMode(!focusMode)} aria-pressed={focusMode}>{focusMode?"Tilbake":"Fokus"}</button><details className="menu tools-menu" onClick={e=>{if((e.target as HTMLElement).closest("button"))e.currentTarget.open=false;}}><summary>Flere verktøy</summary><div>
                {!pygameView&&<><button onClick={runSelectedCode} disabled={runnerBusy||!editorSelection.selected.trim()}>Kjør markert</button><button onClick={runTrace} disabled={runnerBusy||!code.trim()}>Følg stegvis</button></>}
                <label>Kodestørrelse<span className="button-row"><button aria-label="Mindre kodetekst" onClick={()=>changeEditorFontSize(-2)}>A−</button><output>{editorFontSize} px</output><button aria-label="Større kodetekst" onClick={()=>changeEditorFontSize(2)}>A+</button></span></label>
                <label>Plass til kode<input aria-label="Plass til kode" type="range" min="40" max="75" value={editorShare} onChange={e=>setEditorShare(Number(e.target.value))}/></label>
                <button onClick={pygameView?downloadPygameCode:downloadProject}>Last ned .py</button>
                {!pygameView&&<><button onClick={copyCodeAsText}>Kopier kode + svar</button><button onClick={()=>copyCodeAsImage(activeLocalFile.name)}>Bilde av kode + svar</button></>}
                <button onClick={restorePreviousDraft}>Gjenopprett forrige utkast</button><button onClick={()=>replaceWithUndo("")}>Tøm kodefeltet</button>
              </div></details></div></div>
              <div className="file-strip"><strong>{pygameView?"pygame-spill.py":playground?activeLocalFile.name:"verksted.py"}</strong>{view==="learn"&&<div className="lab-tabs" aria-label="Arbeidsmåte"><button aria-pressed={labTab==="practice"} onClick={()=>{stopExecution();switchLabTab("practice");}}>Skriv selv</button><button aria-pressed={labTab==="solution"} onClick={()=>{stopExecution();switchLabTab("solution");}}>Fasit</button></div>}{!pygameView&&<button onClick={()=>setFilesOpen(!filesOpen)} aria-expanded={filesOpen}>Filer {dataFiles.length?`(${dataFiles.length})`:""}</button>}</div>
              {filesOpen&&!pygameView&&<div className="workspace-files">{playground&&<><div className="project-file-tabs" aria-label="Python-filer i prosjektet">{activeLocalProject.files!.map(f=><button key={f.id} aria-pressed={f.id===activeLocalProject.activeFileId} onClick={()=>{stopExecution();selectProjectFile(f.id);}}>{f.name}</button>)}<button onClick={createProjectFile}>+ Ny fil</button></div><div className="button-row"><button onClick={renameProject}>Gi prosjekt nytt navn</button><button onClick={renameProjectFile}>Gi fil nytt navn</button><label className="file-upload">Importer .py<input type="file" accept=".py" onChange={importProject}/></label><button onClick={deleteProjectFile}>Slett åpen fil</button><button onClick={deleteProject}>Slett prosjekt</button>{window.bjornsveenDesktop&&<><button onClick={openDesktopProject}>Åpne fra Mac</button><button onClick={()=>void saveDesktopProject()}>Lagre på Mac</button></>}</div></>}{dataFileShelf()}<p className="muted">Datafiler lagres sammen med arbeidsområdet. Python-filer som programmet selv oppretter, finnes bare i den kjøringen.</p></div>}
              {undoCode!==null&&<div className="undo-notice" role="status">Koden er byttet. Forrige utkast er bevart.<button onClick={undoReplacement}>Angre byttet</button></div>}
              <label htmlFor={editorId} className="sr-only">{pygameView?"Skriv Pygame-kode":"Skriv Python-kode"}</label>
              <PythonEditor id={editorId} value={pygameView?pygameCode:code} onChange={pygameView?updatePygameCode:updateCode} describedBy="studio-editor-help" fontSize={editorFontSize} errorLine={executedCode===code?errorCoach?.lineNumber:undefined} onSelectionChange={(start,end,selected)=>setEditorSelection({start,end,selected})}/>
              <div id="studio-editor-help" className="studio-editor-footer"><span>{pygameView?"Klikk i spillflaten for å bruke piltastene.":"Python kjører lokalt på enheten din."}</span><span>Tab: innrykk · Esc, så Tab: gå videre</span></div>
            </section>
            <section className={`output-panel studio-output ${resultIsStale?"is-stale":""}`} aria-label="Resultat">
              <header><h2>{pygameView?"Spillflate":"Resultat"}</h2><span role="status">{pygameView?pygameStatus==="running"?"● Kjører":"Pygame":runnerBusy?runButtonLabel:runnerStatus==="error"?"! Stoppet":executedCode!==null?"✓ Ferdig":"Klar"}</span></header>
              {!pygameView&&<nav className="result-tabs" aria-label="Resultatverktøy"><button aria-pressed={resultTab==="output"} onClick={()=>setResultTab("output")}>Utskrift og grafikk</button><button aria-pressed={resultTab==="variables"} onClick={()=>setResultTab("variables")}>Variabler</button><button aria-pressed={resultTab==="trace"} onClick={()=>setResultTab("trace")}>Steg</button></nav>}
              <div className="result-scroll">
                {pygameView ? <><div className="pygame-frame-wrap"><iframe key={pygameFrameKey} ref={pygameFrameRef} src="./pygame-runner.html" title="Pygame-spillflate" allow="autoplay" /></div><button onClick={savePygameImage}>Lagre bilde</button><pre className="pygame-console" aria-live="polite">{pygameConsole}</pre></> : <>
                  {resultIsStale&&<p className="stale-result-notice" role="status"><strong>Koden er endret.</strong> Dette er resultatet fra forrige kjøring. Kjør på nytt før du vurderer svaret.</p>}
                  {resultTab==="output"&&<>{errorCoach?errorCoachPanel():<pre className="console-output" aria-live="polite">{output}</pre>}{plotGallery()}</>}
                  {resultTab==="variables"&&(pythonVariables.length?variableInspector():<p className="empty-result">Kjør koden for å se variablene. Verdiene gjelder siste kjøring.</p>)}
                  {resultTab==="trace"&&(traceSteps.length?tracePlayer():<div className="empty-result"><h3>Forutsi neste steg</h3><p>Kjør en gjennomgang, og følg hvordan verdiene endres foran hver linje.</p><button onClick={runTrace} disabled={runnerBusy||!code.trim()}>Følg stegvis</button></div>)}
                </>}
              </div>
            </section>
          </div>
          {helpOpen&&<Suspense fallback={<aside className="help-panel">Laster hjelp …</aside>}><HelpPanel initialQuery={helpQuery} initialTopic={helpTopic} onTopic={setHelpAddress} onClose={closeHelp} onInsert={insertHelpExample} onExample={newHelpExample}/></Suspense>}
        </div>
      </>}
      {shareStatus&&<div className="studio-status" role="status">{shareStatus}<button aria-label="Lukk status" onClick={()=>setShareStatus("")}>×</button></div>}
      <CoursePrint/>
      {turtleExpanded && turtleDrawing && (
        <div ref={turtleDialogRef} className="plot-modal turtle-modal" role="dialog" aria-modal="true" aria-label="Turtle-tegning i stor visning" onClick={() => setTurtleExpanded(false)} tabIndex={-1}>
          <div className="plot-modal-card turtle-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="plot-modal-bar">
              <strong>Stegvis Turtle-tegning</strong>
              <button type="button" className="plot-close" onClick={() => setTurtleExpanded(false)} aria-label="Lukk stor Turtle-visning">Lukk</button>
            </div>
            <TurtlePlayer
              drawing={turtleDrawing}
              settings={turtleWorkshop}
              onSettingsChange={setTurtleWorkshop}
              onDownload={downloadTurtle}
              onDownloadSvg={downloadTurtleSvg}
              large
            />
          </div>
        </div>
      )}
      {expandedPlotIndex !== null && plotImages[expandedPlotIndex] && (
        <div ref={plotDialogRef} className="plot-modal" role="dialog" aria-modal="true" aria-label={`Graf ${expandedPlotIndex + 1} i stor visning`} onClick={() => setExpandedPlotIndex(null)} tabIndex={-1}>
          <div className="plot-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="plot-modal-bar">
              <strong>{plotImages.length === 1 ? "Graf" : `Graf ${expandedPlotIndex + 1}`}</strong>
              <span>
                <button type="button" onClick={() => downloadPlot(expandedPlotIndex)}>Lagre PNG</button>
                <button type="button" className="plot-close" onClick={() => setExpandedPlotIndex(null)} aria-label="Lukk stor graf">Lukk</button>
              </span>
            </div>
            <img src={`data:image/png;base64,${plotImages[expandedPlotIndex]}`} alt={`Graf ${expandedPlotIndex + 1} laget av Python-koden`} />
          </div>
        </div>
      )}
      {pythonInputRequest && (
        <div className="python-input-modal" role="presentation">
          <form ref={inputDialogRef} className="python-input-card" role="dialog" aria-modal="true" aria-labelledby="python-input-title" onSubmit={submitPythonInput}>
            <header>
              <span>Programmet ditt spør · input {pythonInputRequest.index + 1}</span>
              <h2 id="python-input-title">Skriv et svar til Python</h2>
            </header>
            <div className="python-input-body">
              <p className="python-input-prompt">{pythonInputRequest.prompt}</p>
              <label htmlFor="python-input-answer">Svaret ditt</label>
              <input
                id="python-input-answer"
                value={pythonInputValue}
                onChange={(event) => setPythonInputValue(event.target.value)}
                placeholder="Skriv her …"
                autoComplete="off"
                autoFocus
              />
              <p className="python-input-tip"><strong>Husk:</strong> <code>input()</code> gir alltid tekst. <code>int(...)</code> gjør heltallstekst om til et tall, mens <code>float(...)</code> brukes til desimaltall.</p>
            </div>
            <footer>
              <button type="button" className="python-input-cancel" onClick={cancelPythonInput}>Stopp programmet</button>
              <button type="submit" className="python-input-submit">Send svaret til Python →</button>
            </footer>
          </form>
        </div>
      )}
      {feedbackDialogOpen && (
        <div className="feedback-modal" role="presentation" onMouseDown={() => setFeedbackDialogOpen(false)}>
          <section ref={feedbackDialogRef} className="feedback-card" role="dialog" aria-modal="true" aria-labelledby="feedback-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>Hjelp oss å bli bedre</span>
                <h2 id="feedback-title">Gi tilbakemelding</h2>
              </div>
              <button type="button" onClick={() => setFeedbackDialogOpen(false)} aria-label="Lukk tilbakemeldingsvinduet">Lukk</button>
            </header>
            <p className="feedback-intro">Fortell hva som fungerte, hva som var vanskelig eller hva dere savner. Knappen åpner e-postprogrammet med en ferdig strukturert melding.</p>

            <div className="feedback-fields">
              <label>
                <span>Hva gjelder det?</span>
                <select value={feedbackKind} onChange={(event) => setFeedbackKind(event.target.value)}>
                  <option>Forslag</option>
                  <option>Feil i appen</option>
                  <option>Faglig innhold</option>
                  <option>Lesbarhet og bruk</option>
                  <option>Ros eller annet</option>
                </select>
              </label>
              <label className="feedback-message">
                <span>Tilbakemelding <b>påkrevd</b></span>
                <textarea
                  value={feedbackMessage}
                  onChange={(event) => setFeedbackMessage(event.target.value)}
                  placeholder="Hva prøvde dere å gjøre? Hva skjedde? Hva ville gjort det bedre?"
                  rows={7}
                  autoFocus
                />
              </label>
              <div className="feedback-optional">
                <label><span>Skole <small>valgfritt</small></span><input value={feedbackSchool} onChange={(event) => setFeedbackSchool(event.target.value)} /></label>
                <label><span>Navn <small>valgfritt</small></span><input value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} /></label>
              </div>
            </div>

            <div className="feedback-privacy">
              <strong>Ingen skjult innsending</strong>
              <p>Appen lagrer ikke teksten. Du ser og kan endre hele e-posten før du sender den til <code>skolepython@gmail.com</code>.</p>
            </div>
            <footer>
              <button type="button" className="feedback-cancel" onClick={() => setFeedbackDialogOpen(false)}>Avbryt</button>
              <button type="button" className="feedback-send" onClick={composeFeedbackEmail} disabled={!feedbackMessage.trim()}>Åpne ferdig e-post →</button>
            </footer>
          </section>
        </div>
      )}

    </main>
  );
}
