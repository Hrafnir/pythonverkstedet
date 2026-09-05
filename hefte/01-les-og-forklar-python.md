# Modul 1: Les og forklar Python-kode

Dette lærerheftet brukes sammen med [den oppdaterte arbeidsflaten](02-bruk-arbeidsflaten.md). I appen finner du stoffet under Lær → Variabler, med egne steg for forutsigelse, utprøving og forklaring.

## Målet med modulen

Etter denne modulen skal læreren og eleven kunne:

- lese et kort program ovenfra og ned
- forklare forskjellen på en verdi, en variabel og et uttrykk
- følge hvordan variabelverdier endres
- forutsi hva programmet skriver ut
- forklare matematikken i programmet med egne ord

Tidsbruk: 45–60 minutter.

## Først: Kode er en presis oppskrift

Python utfører normalt én linje om gangen, ovenfra og ned. Vi trenger ikke forstå alt samtidig. Vi kan stoppe etter hver linje og spørre:

1. Hvilken linje utføres?
2. Hvilke verdier finnes nå?
3. Hva blir neste steg?

## Eksempel 1: Pris med rabatt

```python
pris = 800
rabatt = 0.25
ny_pris = pris * (1 - rabatt)
print(ny_pris)
```

### Linje for linje

- `pris = 800` gir variabelen `pris` verdien 800.
- `rabatt = 0.25` gir variabelen `rabatt` verdien 0,25. Python bruker punktum som desimalskilletegn.
- `1 - rabatt` blir 0,75. Det er vekstfaktoren etter 25 prosent rabatt.
- `pris * (1 - rabatt)` blir `800 * 0.75`, altså 600.
- `print(ny_pris)` skriver verdien 600 på skjermen.

### Sportabell

| Etter linje | `pris` | `rabatt` | `ny_pris` | Utskrift |
|---|---:|---:|---:|---:|
| 1 | 800 | – | – | – |
| 2 | 800 | 0.25 | – | – |
| 3 | 800 | 0.25 | 600.0 | – |
| 4 | 800 | 0.25 | 600.0 | 600.0 |

At Python viser `600.0` i stedet for `600`, betyr bare at resultatet er lagret som et desimaltall.

## Fire tegn som ofte skaper forvirring

| Python | Betyr | Eksempel |
|---|---|---|
| `=` | gi en variabel en verdi | `x = 4` |
| `==` | sammenlign to verdier | `x == 4` blir sann |
| `**` | potens | `3 ** 2` blir 9 |
| `%` | rest ved heltallsdivisjon | `7 % 2` blir 1 |

I matematikk leser vi ofte `=` som «er lik». I Python betyr `=` omtrent «lagre verdien på høyre side i navnet på venstre side».

## Eksempel 2: En verdi endres

```python
x = 3
x = x + 2
x = x * 4
print(x)
```

Dette er lovlig i programmering selv om `x = x + 2` ikke er en gyldig matematisk ligning. Høyresiden regnes ut først. Deretter lagres den nye verdien i `x`.

| Etter linje | `x` |
|---|---:|
| 1 | 3 |
| 2 | 5 |
| 3 | 20 |
| 4 | 20 |

Programmet skriver ut `20`.

## Eksempel 3: Hva undersøker koden?

```python
tall = 17

if tall % 2 == 0:
    print("partall")
else:
    print("oddetall")
```

`tall % 2` er resten når tallet deles på 2. Hvis resten er 0, er tallet et partall. For 17 er resten 1, så programmet skriver ut `oddetall`.

Legg merke til kolonet og innrykket. Innrykket viser hvilke linjer som hører til `if` og `else`.

## En fast metode for å forklare kode

Bruk denne setningsrammen:

> Programmet skal ________. Først ________. Deretter ________. Hvis ________, så ________. Til slutt ________. Når startverdien er ________, blir resultatet ________, fordi ________.

En god forklaring av eksempel 3 kan være:

> Programmet undersøker om et heltall er partall eller oddetall. Først lagres 17 i variabelen `tall`. Deretter finner programmet resten når 17 deles på 2. Resten er ikke 0, så vilkåret er usant og `else`-delen utføres. Derfor skrives «oddetall» ut.

## Oppgaver

### 1. Les

Hva skriver programmet ut? Forklar alle linjene.

```python
lengde = 8
bredde = 5
areal = lengde * bredde
print(areal)
```

### 2. Følg verdiene

Lag en sportabell og finn utskriften.

```python
penger = 1000
penger = penger * 1.04
penger = penger + 200
print(penger)
```

### 3. Finn matematikken

Hva undersøker programmet? Hva skrives ut når `n = 5`?

```python
n = 5
verdi = n ** 2 + n

if verdi % 2 == 0:
    print("delelig med 2")
else:
    print("ikke delelig med 2")
```

### 4. Finn feilen

En elev vil regne ut prisen etter 20 prosent rabatt:

```python
pris = 500
rabatt = 20
ny_pris = pris * (1 - rabatt)
print(ny_pris)
```

Forklar hvorfor svaret blir feil, og foreslå en rettelse.

### 5. Endre

Endre bare én verdi i eksempel 1 slik at programmet regner med 30 prosent rabatt. Forutsi svaret før du kjører koden.

## Fasit og lærerkommentar

### Oppgave 1

Programmet lagrer lengde 8 og bredde 5, multipliserer dem og lagrer 40 i `areal`. Det skriver ut `40`.

### Oppgave 2

Etter første linje er `penger` 1000. Deretter blir verdien 1040.0 og så 1240.0. Programmet skriver ut `1240.0`.

### Oppgave 3

Programmet undersøker om uttrykket \(n^2+n\) er delelig med 2. Når `n = 5`, blir verdien 30. Resten ved divisjon på 2 er 0, så programmet skriver ut `delelig med 2`.

En mulig videre samtale er hvorfor \(n^2+n=n(n+1)\) alltid er partall for heltall: Produktet består av to påfølgende heltall, og ett av dem må være partall.

### Oppgave 4

Tallet 20 betyr tjue hele, ikke 20 prosent. Bruk for eksempel `rabatt = 0.20`. Da blir ny pris 400.0.

### Oppgave 5

Endre til `rabatt = 0.30`. Ny pris blir 560.0.

## Underveisvurdering

Be eleven forklare ett av programmene muntlig uten å kjøre det. Lytt etter om eleven:

- følger linjene i riktig rekkefølge
- bruker de faktiske variabelverdiene
- skiller mellom `=` og `==`
- knytter programmet til riktig matematisk idé
- begrunner resultatet framfor bare å oppgi det

En elev som gjør dette, viser direkte relevant kompetanse i å lese og forklare tekstbasert Python-kode.
