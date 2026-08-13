Bjørnsveen Pythonverksted – offline macOS-prototype

Målplattform: MacBook Neo / Apple Silicon (ARM64)
Bundle-ID: no.bjornsveen.pythonverksted

Denne prototypen:
- inneholder Python/Pyodide lokalt
- inneholder en kuratert skolepakke med NumPy, pandas, Matplotlib, SciPy,
  SymPy, scikit-learn, Pillow, NetworkX og avhengigheter
- har en lokal Turtle-variant for geometriske figurer og mønstre; tegningene
  gjengis steg for steg i et høyoppløselig canvas med variabel hastighet,
  uten egne vinduer eller nettverk
- blokkerer alle nettverksforespørsler fra appen
- bruker lokale prosjektfiler og lokale nettleserdata
- har ingen automatisk oppdatering, innlogging, KI eller kommunikasjon

DMG er ment for funksjonstesting. PKG er ment for pilotutrulling via MDM.
Produksjonsutgaven må signeres med kommunens Developer ID Application- og
Developer ID Installer-sertifikater og notariseres før bred distribusjon.

Byggvariabler:
MAC_APP_IDENTITY="Developer ID Application: ..."
MAC_INSTALLER_IDENTITY="Developer ID Installer: ..."

IT bør gjennomføre pilot på samme macOS-versjon og samme MDM-policy som
eksamensmaskinene. Årlig eksamensveiledning avgjør om appen kan brukes på del 2.
