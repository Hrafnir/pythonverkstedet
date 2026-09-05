export type PygameTutorial = {
  id: string;
  step: number;
  title: string;
  shortTitle: string;
  goal: string;
  question: string;
  explanation: string;
  newIdeas: { code: string; explanation: string }[];
  code: string;
  observe: string[];
  experiments: string[];
};

export const pygameTutorials: PygameTutorial[] = [
  {
    id: "game-loop",
    step: 1,
    title: "Start Pygame og lag spilløkka",
    shortTitle: "Spilløkka",
    goal: "Få fram en spillflate som oppdateres uten at nettleseren fryser.",
    question: "Hvordan kan et spill fortsette å lytte, tenke og tegne helt til spilleren stopper det?",
    explanation: "Et spill er ikke ett ferdig bilde. Det lager nye bilder mange ganger i sekundet. Derfor trenger vi en løkke som leser hendelser, tegner neste bilde og gir nettleseren tid til å vise det.",
    newIdeas: [
      { code: "pygame.init()", explanation: "starter delene av Pygame vi trenger" },
      { code: "pygame.display.set_mode((800, 500))", explanation: "lager en spillflate som er 800 piksler bred og 500 høy" },
      { code: "while kjorer:", explanation: "gjentar spillkoden så lenge variabelen er True" },
      { code: "await asyncio.sleep(0)", explanation: "slipper nettleseren til mellom bildene, slik at siden ikke låser seg" },
    ],
    code: `import pygame
import asyncio

# 1. Gjør Pygame klart
pygame.init()

# 2. Lag spillflaten
skjerm = pygame.display.set_mode((800, 500))
pygame.display.set_caption("Mitt første Pygame-spill")
klokke = pygame.time.Clock()

# 3. Spilløkka fortsetter helt til vi stopper den
kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN and hendelse.key == pygame.K_ESCAPE:
            kjorer = False

    # RGB: lite rødt, litt mer grønt og blått
    skjerm.fill((20, 45, 55))

    # Vis bildet vi nettopp tegnet
    pygame.display.flip()

    # Nettleserregelen og ønsket fart: 60 bilder i sekundet
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvilke to tall bestemmer størrelsen på spillflaten?",
      "Hvorfor ligger skjerm.fill inne i while-løkka?",
      "Hva tror du skjer hvis kjorer blir False?",
    ],
    experiments: [
      "Endre ett av RGB-tallene i skjerm.fill.",
      "Bytt vindustittelen.",
      "Endre 60 til 20. Du ser ikke forskjell ennå, men tallet blir viktig når noe beveger seg.",
    ],
  },
  {
    id: "draw-player",
    step: 2,
    title: "Tegn en spiller med et rektangel",
    shortTitle: "Spilleren",
    goal: "Lage en figur med posisjon, bredde, høyde og farge.",
    question: "Hva trenger Python å vite for å kunne plassere en figur på riktig sted?",
    explanation: "Pygame bruker koordinater. Punktet (0, 0) ligger øverst til venstre. x øker mot høyre, og y øker nedover. Et Rect samler posisjon og størrelse i én variabel.",
    newIdeas: [
      { code: "spiller = pygame.Rect(370, 410, 60, 60)", explanation: "lager et rektangel med x, y, bredde og høyde" },
      { code: "pygame.draw.rect(skjerm, farge, spiller)", explanation: "tegner rektangelet på spillflaten" },
      { code: "spiller.center", explanation: "er punktet midt i rektangelet" },
    ],
    code: `import pygame
import asyncio

pygame.init()
skjerm = pygame.display.set_mode((800, 500))
klokke = pygame.time.Clock()

# x = 370, y = 410, bredde = 60, høyde = 60
spiller = pygame.Rect(370, 410, 60, 60)
spillerfarge = (244, 111, 78)

kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN and hendelse.key == pygame.K_ESCAPE:
            kjorer = False

    skjerm.fill((20, 45, 55))

    # Tegn spilleren etter bakgrunnen, ellers blir spilleren dekket til
    pygame.draw.rect(skjerm, spillerfarge, spiller, border_radius=10)

    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvorfor tegner vi bakgrunnen før spilleren?",
      "Hvilken verdi må øke for å flytte spilleren mot høyre?",
      "Hvor er omtrent punktet (400, 250) på spillflaten?",
    ],
    experiments: [
      "Endre spillerens x-verdi fra 370 til 50.",
      "Lag en bred og lav spiller.",
      "Bytt spillerfargen og verdien til border_radius.",
    ],
  },
  {
    id: "move-player",
    step: 3,
    title: "Flytt spilleren med piltastene",
    shortTitle: "Bevegelse",
    goal: "Lese tastaturet og endre koordinatene litt for hvert bilde.",
    question: "Hvordan blir mange små endringer i x og y til jevn bevegelse?",
    explanation: "For hvert bilde spør programmet hvilke taster som holdes inne. En liten endring gjentas opptil 60 ganger i sekundet. Det ser ut som sammenhengende bevegelse.",
    newIdeas: [
      { code: "taster = pygame.key.get_pressed()", explanation: "lager en oversikt over tastene som holdes inne akkurat nå" },
      { code: "spiller.x += fart", explanation: "flytter spilleren mot høyre" },
      { code: "spiller.clamp_ip(skjerm.get_rect())", explanation: "holder hele spilleren innenfor spillflaten" },
    ],
    code: `import pygame
import asyncio

pygame.init()
skjerm = pygame.display.set_mode((800, 500))
klokke = pygame.time.Clock()

spiller = pygame.Rect(370, 410, 60, 60)
fart = 5

kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN and hendelse.key == pygame.K_ESCAPE:
            kjorer = False

    # Undersøk tastene én gang for hvert bilde
    taster = pygame.key.get_pressed()
    if taster[pygame.K_LEFT]:
        spiller.x -= fart
    if taster[pygame.K_RIGHT]:
        spiller.x += fart
    if taster[pygame.K_UP]:
        spiller.y -= fart
    if taster[pygame.K_DOWN]:
        spiller.y += fart

    # Endrer posisjonen hvis spilleren er på vei utenfor
    spiller.clamp_ip(skjerm.get_rect())

    skjerm.fill((20, 45, 55))
    pygame.draw.rect(skjerm, (244, 111, 78), spiller, border_radius=10)

    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvorfor trekker vi fra fart når venstretasten holdes inne?",
      "Hvorfor må y bli mindre når spilleren går opp?",
      "Hva er forskjellen på å lese KEYDOWN og get_pressed()?",
    ],
    experiments: [
      "Prøv fart = 1 og fart = 12.",
      "Fjern clamp_ip midlertidig. Hvor blir spilleren av?",
      "La W, A, S og D styre med pygame.K_w, pygame.K_a, pygame.K_s og pygame.K_d.",
    ],
  },
  {
    id: "coin-collision",
    step: 4,
    title: "Lag en mynt og oppdag kollisjon",
    shortTitle: "Kollisjon",
    goal: "Plassere et mål tilfeldig og oppdage når spilleren treffer det.",
    question: "Hvordan kan programmet vite at to figurer overlapper hverandre?",
    explanation: "Vi lar både spilleren og mynten ha usynlige Rect-bokser. colliderect er True når boksene overlapper. Da flytter vi mynten til et nytt tilfeldig sted.",
    newIdeas: [
      { code: "random.randint(30, 770)", explanation: "velger et tilfeldig heltall mellom grensene" },
      { code: "spiller.colliderect(mynt)", explanation: "sjekker om de to rektanglene overlapper" },
      { code: "mynt.center = (...) ", explanation: "flytter sentrum av mynten til et nytt punkt" },
    ],
    code: `import pygame
import asyncio
import random

pygame.init()
skjerm = pygame.display.set_mode((800, 500))
klokke = pygame.time.Clock()

spiller = pygame.Rect(370, 410, 60, 60)
mynt = pygame.Rect(0, 0, 30, 30)
mynt.center = (random.randint(30, 770), random.randint(30, 470))
fart = 5

kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN and hendelse.key == pygame.K_ESCAPE:
            kjorer = False

    taster = pygame.key.get_pressed()
    if taster[pygame.K_LEFT]:
        spiller.x -= fart
    if taster[pygame.K_RIGHT]:
        spiller.x += fart
    if taster[pygame.K_UP]:
        spiller.y -= fart
    if taster[pygame.K_DOWN]:
        spiller.y += fart
    spiller.clamp_ip(skjerm.get_rect())

    # True betyr at spilleren berører mynten
    if spiller.colliderect(mynt):
        mynt.center = (random.randint(30, 770), random.randint(30, 470))

    skjerm.fill((20, 45, 55))
    pygame.draw.rect(skjerm, (244, 111, 78), spiller, border_radius=10)
    pygame.draw.circle(skjerm, (244, 201, 93), mynt.center, 15)

    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvorfor bruker mynten både en Rect og en sirkel?",
      "Hvorfor velger random-tallene ikke helt fra 0 til 800 og 0 til 500?",
      "Når blir if-betingelsen sann?",
    ],
    experiments: [
      "Gjør mynten større. Husk å endre både Rect-størrelsen og sirkelradiusen.",
      "La mynten bare dukke opp på høyre halvdel.",
      "Skriv ut mynt.center hver gang mynten treffes.",
    ],
  },
  {
    id: "score-text",
    step: 5,
    title: "Tell poeng og skriv tekst på skjermen",
    shortTitle: "Poeng",
    goal: "Oppdatere en poengvariabel og vise verdien inne i spillet.",
    question: "Hvordan kan en variabel huske det som skjedde i tidligere runder av spilløkka?",
    explanation: "poeng lages før løkka og beholder verdien mellom hvert bilde. Ved kollisjon bruker vi += 1. Fonten lager et lite bilde av teksten, og blit plasserer tekstbildet på skjermen.",
    newIdeas: [
      { code: "poeng += 1", explanation: "øker den gamle verdien med én og lagrer den nye" },
      { code: "font.render(...)", explanation: "gjør teksten om til noe Pygame kan tegne" },
      { code: "skjerm.blit(tekst, (20, 20))", explanation: "plasserer tekstbildet 20 piksler fra venstre og toppen" },
    ],
    code: `import pygame
import asyncio
import random

pygame.init()
skjerm = pygame.display.set_mode((800, 500))
klokke = pygame.time.Clock()
font = pygame.font.Font(None, 40)

spiller = pygame.Rect(370, 410, 60, 60)
mynt = pygame.Rect(0, 0, 30, 30)
mynt.center = (random.randint(30, 770), random.randint(30, 470))
fart = 5
poeng = 0

kjorer = True
while kjorer:
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN and hendelse.key == pygame.K_ESCAPE:
            kjorer = False

    taster = pygame.key.get_pressed()
    if taster[pygame.K_LEFT]:
        spiller.x -= fart
    if taster[pygame.K_RIGHT]:
        spiller.x += fart
    if taster[pygame.K_UP]:
        spiller.y -= fart
    if taster[pygame.K_DOWN]:
        spiller.y += fart
    spiller.clamp_ip(skjerm.get_rect())

    if spiller.colliderect(mynt):
        poeng += 1
        mynt.center = (random.randint(30, 770), random.randint(30, 470))

    skjerm.fill((20, 45, 55))
    pygame.draw.rect(skjerm, (244, 111, 78), spiller, border_radius=10)
    pygame.draw.circle(skjerm, (244, 201, 93), mynt.center, 15)

    poengtekst = font.render(f"Poeng: {poeng}", True, (235, 242, 238))
    skjerm.blit(poengtekst, (20, 20))

    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvorfor står poeng = 0 før while-løkka?",
      "Hva ville skjedd hvis poeng = 0 stod inne i løkka?",
      "Hvilke deler av font.render er tekst, utjevning og farge?",
    ],
    experiments: [
      "Gi fem poeng for hver mynt.",
      "Flytt poengteksten til øverst til høyre.",
      "Lag en ny tekst som viser spillerens x-koordinat.",
    ],
  },
  {
    id: "catch-the-coin",
    step: 6,
    title: "Ferdig spill: Fang mynten",
    shortTitle: "Ferdig spill",
    goal: "Sette sammen spilløkke, bevegelse, tilfeldighet, kollisjon, poeng og seier.",
    question: "Hvordan kan flere små programmeringsideer sammen bli et helt spill?",
    explanation: "Dette er den første komplette versjonen. Målet er ti poeng. Når spilleren vinner, stopper bevegelsen og mellomromstasten starter en ny runde. Les koden som seks små deler – ikke som én stor vegg.",
    newIdeas: [
      { code: "vunnet = poeng >= maal", explanation: "lager en boolsk variabel som forteller hvilken spilltilstand vi er i" },
      { code: "if not vunnet:", explanation: "lar bevegelse og kollisjon skje bare mens runden pågår" },
      { code: "pygame.K_SPACE", explanation: "brukes til å starte en ny runde etter seier" },
      { code: "spiller.center = skjerm.get_rect().center", explanation: "plasserer spilleren midt på skjermen ved omstart" },
    ],
    code: `import pygame
import asyncio
import random

# DEL 1: Start spillet
pygame.init()
skjerm = pygame.display.set_mode((800, 500))
pygame.display.set_caption("Fang mynten")
klokke = pygame.time.Clock()
font = pygame.font.Font(None, 40)
stor_font = pygame.font.Font(None, 72)

# DEL 2: Lag spillfigurene og variablene
spiller = pygame.Rect(370, 410, 60, 60)
mynt = pygame.Rect(0, 0, 30, 30)
mynt.center = (random.randint(30, 770), random.randint(70, 470))
fart = 5
poeng = 0
maal = 10

# DEL 3: Spilløkka
kjorer = True
while kjorer:
    vunnet = poeng >= maal

    # Les enkelthendelser som avslutt og mellomrom
    for hendelse in pygame.event.get():
        if hendelse.type == pygame.QUIT:
            kjorer = False
        if hendelse.type == pygame.KEYDOWN:
            if hendelse.key == pygame.K_ESCAPE:
                kjorer = False
            if vunnet and hendelse.key == pygame.K_SPACE:
                poeng = 0
                spiller.center = skjerm.get_rect().center
                mynt.center = (random.randint(30, 770), random.randint(70, 470))

    # DEL 4: Beveg spilleren mens runden pågår
    if not vunnet:
        taster = pygame.key.get_pressed()
        if taster[pygame.K_LEFT]:
            spiller.x -= fart
        if taster[pygame.K_RIGHT]:
            spiller.x += fart
        if taster[pygame.K_UP]:
            spiller.y -= fart
        if taster[pygame.K_DOWN]:
            spiller.y += fart
        spiller.clamp_ip(skjerm.get_rect())

        # Treffer spilleren mynten?
        if spiller.colliderect(mynt):
            poeng += 1
            mynt.center = (random.randint(30, 770), random.randint(70, 470))

    # DEL 5: Tegn neste bilde
    skjerm.fill((20, 45, 55))
    pygame.draw.rect(skjerm, (244, 111, 78), spiller, border_radius=10)
    pygame.draw.circle(skjerm, (244, 201, 93), mynt.center, 15)

    poengtekst = font.render(f"Poeng: {poeng} / {maal}", True, (235, 242, 238))
    skjerm.blit(poengtekst, (20, 20))

    # DEL 6: Vis seier og forklar hvordan en ny runde startes
    if vunnet:
        seier = stor_font.render("Du vant!", True, (121, 224, 166))
        beskjed = font.render("Trykk mellomrom for ny runde", True, (235, 242, 238))
        skjerm.blit(seier, seier.get_rect(center=(400, 210)))
        skjerm.blit(beskjed, beskjed.get_rect(center=(400, 285)))

    pygame.display.flip()
    await asyncio.sleep(0)
    klokke.tick(60)

pygame.quit()`,
    observe: [
      "Hvilke linjer styrer overgangen mellom «spiller» og «vunnet»?",
      "Hvorfor bruker vi KEYDOWN for omstart, men get_pressed for bevegelse?",
      "Finn ett sted der en variabel gjør det enkelt å endre vanskelighetsgraden.",
    ],
    experiments: [
      "Lag tre vanskelighetsgrader ved å endre fart og maal.",
      "Gi mynten en ny farge hver gang den fanges.",
      "Legg inn en rød hindring. Bruk colliderect til å trekke fra ett poeng.",
      "Lag en tidsgrense med pygame.time.get_ticks().",
    ],
  },
];
