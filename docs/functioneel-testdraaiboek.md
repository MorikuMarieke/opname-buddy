# Bijlage D — Functioneel testdraaiboek OpnameBuddy

| Documentgegeven | Waarde |
|---|---|
| Versie | Finale PoC-scope |
| Datum | 24 juli 2026 |
| Productieomgeving | <https://opname-buddy.vercel.app> |
| Repository | <https://github.com/MorikuMarieke/opname-buddy> |

## 1. Doel en afbakening

**Dit is het primaire beoordelaarsdocument** voor de OpnameBuddy-PoC. Gebruik
dit bestand om de applicatie te bedienen, te testen en te presenteren. Overige
demo-documenten zijn ondersteunend (logins, seed, patiëntverhalen).

| Document | Rol |
|---|---|
| Dit bestand (`docs/functioneel-testdraaiboek.md`) | Beoordelaar: test, video, acceptatie |
| [`demo-accounts.md`](./demo-accounts.md) | Inlogaccounts en mapping A1/C1/… → e-mail |
| [`demo-data.md`](./demo-data.md) | `demo:seed` / `demo:cleanup` |
| [`demo-scenarios.md`](./demo-scenarios.md) | Welke patiënt welk verhaal toont |
| [`demo-walkthrough.md`](./demo-walkthrough.md) | Korte pointer naar dit draaiboek |

### Hoe de beoordelaar dit document gebruikt

| Laag | Tijd | Wat doen |
|---|---|---|
| **Video (8–12 min)** | Alleen [§16](#16-korte-demonstratieroute-voor-de-eindpresentatie) | Eén overtuigende keten: Demonstratie-overzicht → Zorgcontext → check-in → DailyBuddy → één participatieactie → autorisatie |
| **Smoke-test (beoordeling)** | ±15–25 min | Minimaal AUTH, CTX, CHK, DB, SEC, LEG (kernfunctionaliteiten + veiligheid) |
| **Volledige acceptatie** | Langer | Alle test-ID’s in dit document |

Dit draaiboek beschrijft hoe de geïmplementeerde functionaliteiten van de
OpnameBuddy-PoC handmatig kunnen worden gecontroleerd. Het document kan worden
gebruikt als:

- acceptatietest vóór oplevering;
- praktische handleiding voor een beoordelaar;
- basis voor de video- of livepresentatie;
- registratielijst voor testresultaten en bewijs.

De vier kernfunctionaliteiten voor de eindopdracht zijn:

1. registreren, inloggen en rolgestuurde toegang;
2. Zorgcontext vastleggen door een zorgverlener;
3. een dagelijkse check-in invullen als patiënt;
4. DailyBuddy-advies genereren op basis van meerdere databronnen.

Daarnaast test dit draaiboek het relevante beheer, patiënt- en opnamebeheer,
patiëntvragen, vrijwilligersbeschikbaarheid, ochtendverzoeken,
middaginteresse en dagelijkse participatieplanning.

Dit is een handmatige functionele test. De technische controles
`typecheck`, `lint`, DailyBuddy-tests en `build` staan als preflight opgenomen,
maar vervangen de handmatige rolflows niet.

## 2. Testadministratie

Vul dit blok in bij de definitieve uitvoering.

| Onderdeel | In te vullen |
|---|---|
| Geteste commit | |
| Branch | |
| Omgeving | ☐ lokaal ☐ Vercel-productie |
| Testdatum en -tijd | |
| Tester | |
| Browser en versie | |
| Schermformaten | |
| Supabase-project | |
| Eindresultaat | ☐ geslaagd ☐ deels geslaagd ☐ mislukt |

Gebruik per test de volgende status:

- `G` — geslaagd;
- `M` — mislukt;
- `N.v.t.` — niet van toepassing op de gekozen testdata;
- `N.u.` — niet uitgevoerd.

## 3. Voorbereiding en testdata

### 3.1 Veilig testen

- Gebruik uitsluitend fictieve testdata.
- Deel accountgegevens en wachtwoorden apart met de beoordelaar. Neem geen
  wachtwoorden, tokens of API-sleutels op in dit document of de repository.
- Voer blijvende mutaties, zoals het aanmaken van accounts en klinische
  patiënten, bij voorkeur uit tegen de lokale of aparte testdatabase.
- Gebruik in productie bestaande demoaccounts en herstel gewijzigde
  beschikbaarheid, Zorgcontext en dagplanning na afloop.
- De datumlogica gebruikt `Europe/Amsterdam`. Voer datumafhankelijke tests uit
  voor de actuele Nederlandse datum.

### 3.2 Benodigde rollen

| Code | Rol of scenario | Minimale uitgangssituatie |
|---|---|---|
| A1 | Beheerder | Actief account met alleen de rol `admin` |
| C1 | Zorgverlener | Actief account met de rol `caregiver` |
| O1 | Activiteitencoördinator | Actief account met de rol `activity_coordinator` |
| V1 | Vrijwilliger | Actief account met de rol `volunteer` |
| P1 | Volledig voorbereide patiënt | Gekoppeld account, actieve opname en complete Zorgcontext |
| P2 | Patiënt zonder check-in | Als P1, maar zonder check-in voor vandaag |
| P3 | Patiënt met incomplete Zorgcontext | Gekoppeld account en actieve opname, maar minstens één essentieel veld staat op onbekend |
| P4 | Patiënt met begrenzende Zorgcontext | Bijvoorbeeld geen zelfstandige toegang of een beperking voor niet-zorgcontact |
| T1 | Tijdelijk testaccount | Alleen voor aanmaken, rollen en activeren/deactiveren |

Eén account mag meerdere scenario’s vervullen als de uitgangssituatie tussendoor
veilig kan worden gewijzigd en daarna wordt hersteld.

### 3.3 Uitgangssituatie voor de volledige ketentest

Bereid voor de meest complete end-to-endtest het volgende voor:

- P1 heeft vandaag nog geen definitief DailyBuddy-advies;
- P1 heeft een complete Zorgcontext en mag zelfstandig naar de activiteitenruimte;
- voor vandaag bestaat nog geen concrete titel voor de gezamenlijke
  middagactiviteit;
- V1 is voor minstens één blok van vandaag wekelijks beschikbaar;
- voor dezelfde datum kan een eenmalige afwezigheid worden toegevoegd en
  verwijderd;
- de inloggegevens voor alle rollen zijn beschikbaar via
  [`demo-accounts.md`](./demo-accounts.md) (demo) of apart gedeeld met de
  beoordelaar.

### 3.4 Werken met `npm run demo:seed`

Na `npm run demo:seed` (zie [`demo-data.md`](./demo-data.md)) bestaan er al
twaalf patiënten met check-in van vandaag en vaak een middagplan **met titel**.
Dat wijkt af van de ideale ketentest in §3.3. Doe daarom eerst deze
voorbereiding (of markeer de betreffende ID’s als `N.v.t.`):

| Playbook-code | Aanbevolen demo-account | Na seed nog nodig |
|---|---|---|
| A1 | `admin.demo@opnamebuddy.test` | Klaar |
| C1 | `caregiver1.demo@opnamebuddy.test` | Klaar |
| O1 | `coordinator.demo@opnamebuddy.test` | Klaar |
| V1 | `volunteer2.demo@opnamebuddy.test` (Finn) | Klaar voor middagplan; Grace (`volunteer3`) voor ochtendblok |
| P1 | `patient10.demo@opnamebuddy.test` (Fatima) | Complete Zorgcontext + toegang `yes`. Voor DB-05–DB-08: wis de **titel** van het middagplan van vandaag (of kies een datum zonder titel) |
| P2 | Bij voorkeur verse testpatiënt | Seed legt voor alle demo-patiënten al een check-in van vandaag aan. Toon DB-01 vóór opslaan van de check-in, of gebruik een nieuw gekoppeld account zonder check-in |
| P3 | `patient6.demo@opnamebuddy.test` (Tom); ook Iris/Lien | Seed zet zelfstandige toegang op `unknown` → DailyBuddy “nog niet beschikbaar” |
| P4 | `patient2.demo@opnamebuddy.test` (Kees) of Mia (`patient7`) | Toegang `no` → geen middaggroep / interesse |
| T1 | Alleen in testomgeving aanmaken | Niet op productie-demoaccounts |

**DailyBuddy-advies** wordt door seed **niet** gegenereerd — P1 start zonder
cached advies; dat klopt met §3.3.

Patiëntverhalen en de DailyBuddy-matrix: [`demo-scenarios.md`](./demo-scenarios.md).

## 4. Aanbevolen testvolgorde

Deze volgorde voorkomt dat een latere test wordt geblokkeerd door ontbrekende
data uit een eerdere rol.

1. Voer de technische preflight uit.
2. Controleer het Demonstratie-overzicht, inloggen en routebeveiliging.
3. Controleer beheer en maak alleen in een testomgeving eventueel tijdelijke
   accounts aan.
4. Controleer als zorgverlener de patiënt, actieve opname en Zorgcontext.
5. Leg als vrijwilliger beschikbaarheid vast.
6. Controleer als coördinator het dagoverzicht zonder concrete
   middagactiviteit.
7. Vul als patiënt de check-in in en test de nog onbekende
   middaginvulling en de vrijblijvende interesseactie.
8. Controleer de interesse bij coördinator en vrijwilliger.
9. Leg als vrijwilliger of coördinator de concrete middagactiviteit vast.
10. Bewerk de check-in van P1 en controleer een nieuwe DailyBuddy-generatie met
    zichtbare voortgang.
11. Test, wanneer de gekozen patiënt daarvoor in aanmerking komt, het
    ochtendverzoek en de terugtrekactie.
12. Rond af met de autorisatie-, route- en responsive controles.

## 5. Technische preflight

Voer de onderstaande commando’s uit op de definitieve commit.

```bash
npm install
npm run typecheck
npm run lint
npm run test:dailybuddy
npm run build
git diff --check HEAD
```

Maak voor een lokale uitvoering eerst `.env.local` aan op basis van
`.env.example`, vul de benodigde Supabase- en OpenAI-variabelen buiten de
repository in en start de applicatie in een apart terminalvenster:

```bash
npm run dev
```

| ID | Verwacht resultaat | Status | Bewijs of notitie |
|---|---|---|---|
| PRE-01 | Installatie rondt af zonder ontbrekende package | | |
| PRE-02 | TypeScript-controle slaagt | | |
| PRE-03 | ESLint-controle slaagt | | |
| PRE-04 | DailyBuddy-safetytests slagen | | |
| PRE-05 | Productiebuild slaagt | | |
| PRE-06 | Git meldt geen whitespacefouten | | |
| PRE-07 | De definitieve commit is naar GitHub gepusht en Vercel heeft juist deze commit gedeployd | | |

Als de finale `package.json` aanvullende gerichte tests bevat, voer die ook uit,
bijvoorbeeld voor DailyBuddy-progress, cachegedrag of
ochtendverzoek-context.

## 6. Demonstratie-overzicht en authenticatie

| ID | Rol en route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| AUTH-01 | Zonder login — `/` | Open de productie-URL | Het **Demonstratie-overzicht** legt uit dat de pagina een test- en navigatiehulp voor de PoC is | |
| AUTH-02 | Zonder login — `/` | Open een roltegel | Een beveiligde bestemming vereist de normale login; de overzichtspagina wisselt geen rol en omzeilt geen autorisatie | |
| AUTH-03 | Zonder login — `/dashboard` | Open de route rechtstreeks | De gebruiker wordt naar de login geleid | |
| AUTH-04 | Login | Vul een verkeerd wachtwoord in | Er verschijnt een begrijpelijke fout; er ontstaat geen sessie | |
| AUTH-05 | Alle vijf rollen | Log per rol in | Standaardroutes: patiënt `/dashboard`, zorgverlener `/care`, coördinator `/planning`, vrijwilliger `/volunteer`, beheerder `/admin` | |
| AUTH-06 | Ingelogde gebruiker | Klik op het OpnameBuddy-hartlogo | De gebruiker keert terug naar het Demonstratie-overzicht; autorisatie van de tegels blijft actief | |
| AUTH-07 | Ingelogde gebruiker | Log uit en gebruik daarna de browser-terugknop | Beveiligde data wordt niet opnieuw toegankelijk; opnieuw inloggen is nodig | |
| AUTH-08 | Patiëntregistratie — `/register` | Registreer in de testomgeving met een uniek e-mailadres | Het account wordt aangemaakt met de patiëntrol. Afhankelijk van de Supabase-configuratie volgt een bevestigingsmelding of directe sessie | |
| AUTH-09 | Nieuw, nog niet gekoppeld patiëntaccount | Open `/dashboard` | Het account wordt naar de koppelpagina geleid en krijgt nog geen klinische patiëntdata te zien | |
| AUTH-10 | Gedeactiveerd T1 | Probeer in te loggen | Inloggen wordt geblokkeerd en de sessie wordt niet behouden | |
| AUTH-11 | Staffaccount met meerdere rollen | Log in | De primaire route volgt `admin` → `activity_coordinator` → `caregiver` → `volunteer` → `patient`; routes voor werkelijk toegekende rollen blijven afzonderlijk beveiligd toegankelijk | |

## 7. Beheerder

Voer muterende accounttests alleen uit met T1 of in een aparte testomgeving.

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| ADM-01 | `/admin` | Bekijk het overzicht | Aantallen voor staff, patiëntaccounts, zorgverleners, vrijwilligers en beheerders laden; recente beheerwijzigingen worden getoond wanneer aanwezig | |
| ADM-02 | `/admin/users` | Wissel tussen **Staff**, **Patiëntaccounts** en **Vrijwilligers** | Iedere tab toont uitsluitend het betreffende accounttype | |
| ADM-03 | `/admin/users` — Staff | Zoek op naam/e-mail en gebruik status- en rolfilters | De lijst en URL-filters worden correct bijgewerkt; **Wis filters** herstelt de volledige lijst | |
| ADM-04 | `/admin/users` — Patiëntaccounts | Wissel tussen **Alle**, **Gekoppeld** en **Niet gekoppeld** | Het alleen-lezen overzicht toont de juiste koppelstatus; hier wordt geen klinische patiënt of opname bewerkt | |
| ADM-05 | `/admin/users` — Vrijwilligers | Zoek en filter op status | Alleen passende vrijwilligersaccounts blijven zichtbaar | |
| ADM-06 | `/admin/users/new` | Maak T1 aan met één staffrol | Het account verschijnt in de lijst en de detailpagina opent zonder dat automatisch een patiëntrol is toegevoegd | |
| ADM-07 | Detail T1 | Wijzig naam/taal en sla op | De profielwijziging wordt bevestigd en blijft na herladen zichtbaar | |
| ADM-08 | Detail T1 | Voeg een tweede staffrol toe en sla op | Beide rollen worden zichtbaar; de standaardroute volgt de vastgelegde rolprioriteit | |
| ADM-09 | Detail T1 | Deactiveer T1, test login en activeer T1 daarna opnieuw | Login is tijdens de deactivatie geblokkeerd en werkt weer na activering | |
| ADM-10 | `/admin/users/new/volunteer` | Maak in de testomgeving een tijdelijk vrijwilligersaccount aan | Het account krijgt uitsluitend de vrijwilligersrol en verschijnt in de vrijwilligerstab | |
| ADM-11 | Account aanmaken | Gebruik een al bestaand e-mailadres | De applicatie toont een fout en maakt geen tweede account aan | |
| ADM-12 | `/admin/roles` | Klik een rolkaart aan | De kaart toont omschrijving en aantal; de link opent de gebruikerslijst met het passende rolfilter | |
| ADM-13 | Adminnavigatie | Controleer de items | **Afdelingen** staat niet in de actieve beheerinterface | |
| ADM-14 | `/admin/departments` | Open de oude route rechtstreeks | De verwijderde beheerpagina wordt niet als actieve functionaliteit getoond; een normale not-foundreactie is toegestaan | |

**Belangrijke domeingrens:** de beheerder beheert accounts en rollen. Het
klinische patiënt- en opnamebeheer staat in de zorgverlenersomgeving. Het
afdelingsveld kan nog onderdeel zijn van een opname of locatie, maar er is geen
actieve module voor afdelingsbeheer, afdelingsfiltering of
afdelingsgebaseerde autorisatie.

## 8. Zorgverlener: patiënt, opname en Zorgcontext

### 8.1 Overzicht en patiëntenlijst

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| CAR-01 | `/care` | Open **Overzicht** | Compact dashboard met titel/intro, drie statistiekkaarten (klinische patiënten, actieve opnames, gekoppelde accounts) en primaire knop **Patiënt opnemen**; geen volledige patiëntentabel en geen opnamefilter | |
| CAR-02 | `/care` | Kies **Alle patiënten bekijken** | Navigeert naar `/care/patients`; er is geen rechts Actions-paneel dat dezelfde acties herhaalt | |
| CAR-03 | `/care/patients` | Open **Patiënten** | Volledige klinische patiëntenlijst met filters **Alle patiënten**, **Actieve opname** en **Geen actieve opname**; teller en sortering (achternaam, voornaam) blijven zichtbaar; geen hernoeming naar **Mijn patiënten** | |
| CAR-04 | `/care/patients` | Bekijk de tabel op desktop en tablet | De kolommen **Check-in** en **Vragen** ontbreken; de resterende kolommen blijven leesbaar | |
| CAR-04a | Patiëntdetail | Open een patiënt vanuit de lijst | Demografische gegevens, actieve opname en accountkoppeling laden voor dezelfde klinische patiënt | |

### 8.2 Klinische patiënt en opname

De tests CAR-05 tot en met CAR-11 maken blijvende gegevens. Voer ze niet uit
op echte of te behouden productiedata.

| ID | Route of situatie | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| CAR-05 | `/care/patients/admit` | Laat verplichte patiënt- of opnamevelden leeg | Er verschijnen veldgerichte validatiemeldingen; er wordt niets opgeslagen | |
| CAR-06 | `/care/patients/admit` | Vul demografische gegevens in die op een bestaande patiënt lijken | Mogelijke matches worden getoond voordat een dubbele patiënt kan worden aangemaakt | |
| CAR-07 | `/care/patients/admit` | Maak een fictieve patiënt met opname aan | Eén klinische patiënt en één actieve opname ontstaan; het patiëntdetail opent | |
| CAR-08 | Patiëntdetail — **Gegevens** | Wijzig een demografisch veld en sla op | De wijziging blijft na herladen zichtbaar | |
| CAR-09 | Patiëntdetail — opname | Wijzig bijvoorbeeld kamer of verwachte ontslagdatum | De bestaande actieve opname wordt bijgewerkt; er ontstaat geen tweede actieve opname | |
| CAR-10 | Patiëntdetail — opname | Kies een verwachte ontslagdatum vóór de opnamedatum | De applicatie weigert de ongeldige datumcombinatie | |
| CAR-11 | Patiëntdetail — accountkoppeling | Genereer een koppelcode | Een zescijferige, tijdelijk geldige code wordt één keer zichtbaar met vervaltijd | |
| CAR-12 | Nieuw patiëntaccount — `/dashboard/link` | Vul minder dan zes cijfers of een ongeldige code in | De koppeling wordt geweigerd met een begrijpelijke fout | |
| CAR-13 | Nieuw patiëntaccount — `/dashboard/link` | Wissel de geldige code uit | Het account wordt aan de klinische patiënt gekoppeld en opent daarna het patiëntdashboard | |
| CAR-14 | Patiëntdetail — opname | Ontsla een tijdelijke testpatiënt | De actieve opname verdwijnt en **Nieuwe opname** wordt beschikbaar | |
| CAR-15 | Patiënt zonder actieve opname | Start een nieuwe opname | Een nieuwe opname wordt gekoppeld aan dezelfde klinische patiënt; er is geen nieuwe accountkoppeling nodig | |

### 8.3 Zorgcontext

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| CTX-01 | `/care/patients/{patientId}/context` | Open P3 met incomplete context | Onbekende essentiële velden en de volledigheidsstatus zijn duidelijk zichtbaar | |
| CTX-02 | Dezelfde route | Vul de essentiële velden in: mobiliteit, transferondersteuning, valrisico, toezicht, bewegingsvrijheid, zelfstandige toegang en isolatie | **Zorgcontext opgeslagen** verschijnt en de volledigheidsstatus wordt bijgewerkt | |
| CTX-03 | Dezelfde route | Kies een mobiliteitsstatus waarvoor een hulpmiddel relevant is | De hulpmiddelvelden verschijnen alleen in deze toepasselijke toestand | |
| CTX-04 | Dezelfde route | Voeg een aandachtspunt, optionele toelichting of algemene notitie toe | De gekozen gegevens worden opgeslagen en na herladen teruggetoond | |
| CTX-05 | Dezelfde route | Bekijk wijzigingsinformatie | Tijdstip en, waar beschikbaar, de verantwoordelijke medewerker worden als auditinformatie getoond | |
| CTX-06 | P1 — `/dashboard/context` | Open dezelfde Zorgcontext als patiënt | De opgeslagen inhoud is leesbaar, maar er zijn geen invoervelden of opslaanknop | |
| CTX-07 | Zorgverlener en patiënt in twee vensters | Wijzig de Zorgcontext als zorgverlener | De patiëntweergave wordt bijgewerkt via de bestaande realtime/read-onlyflow | |
| CTX-08 | Zorgverleneromgeving | Zoek naar patiëntcheck-ins en patiëntvragen | Deze zijn in de huidige PoC niet ontsloten voor de zorgverlener; alleen Zorgcontext wordt inhoudelijk ingezien en beheerd | |

## 9. Vrijwilliger

### 9.1 Profiel en beschikbaarheid

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| VOL-01 | `/volunteer/profile` | Bekijk het accountprofiel | Naam en e-mail zijn alleen-lezen; de bio is bewerkbaar | |
| VOL-02 | `/volunteer/profile` | Wijzig de bio en sla op | Een bevestiging verschijnt en de bio blijft na herladen zichtbaar | |
| VOL-03 | `/volunteer/availability` | Wijzig één ochtend- en één middagblok en bevestig | De wekelijkse beschikbaarheid wordt opgeslagen en blijft na herladen gelijk | |
| VOL-04 | `/volunteer/availability` | Kies een maand en markeer een eenmalige afwezigheid | Alleen normaal beschikbare blokken worden aangeboden; de uitzondering wordt direct opgeslagen | |
| VOL-05 | Dezelfde route | Verwijder de eenmalige afwezigheid | Het blok wordt opnieuw effectief beschikbaar | |
| VOL-06 | `/planning/volunteers` als O1 | Zoek V1 op | De coördinator ziet bio, weekpatroon, effectieve beschikbaarheid en afwezigheid alleen-lezen | |

### 9.2 Dagoverzicht en middagactiviteit

Voer VOL-10 tot en met VOL-13 pas uit nadat de patiëntinteresse uit DB-05 tot en
met DB-08 is gecontroleerd. Een concrete titel verbergt namelijk terecht de
interesseactie voor een nog onbekende invulling.

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| VOL-07 | `/volunteer` | Kies vandaag | Ochtendblok, effectieve beschikbaarheid, ochtendverzoeken, geaggregeerde patiëntbehoeften en het middagblok laden | |
| VOL-08 | `/volunteer` | Bekijk de middaginteresse | Alleen het geaggregeerde aantal is zichtbaar; de vrijwilliger krijgt via deze telling geen namen of kamernummers | |
| VOL-09 | `/volunteer` | Bekijk een ochtendverzoek | Alleen toegestane beslisinformatie wordt getoond: naam, kamer indien aanwezig, vrijwillige boodschap/inspiratie en afgeleide badges; ruwe klinische velden blijven verborgen | |
| VOL-10 | `/volunteer` zonder opgeslagen titel | Bekijk het activiteitengedeelte | Het invoerformulier staat direct open | |
| VOL-11 | Dezelfde route | Sla categorie, titel en optioneel patiëntbericht op | Eén dagplan wordt opgeslagen; de compacte kaart **Vastgelegde middagactiviteit** verschijnt | |
| VOL-12 | Opgeslagen activiteit | Kies **Middagactiviteit wijzigen** en daarna **Annuleren** | Het vooringevulde formulier sluit en de opgeslagen samenvatting blijft ongewijzigd | |
| VOL-13 | Opgeslagen activiteit | Wijzig de titel of boodschap en kies **Wijziging opslaan** | De bestaande rij voor die datum wordt bijgewerkt; samenvatting en auditinformatie vernieuwen zonder duplicaatformulier | |

De vrijwilliger kan een ochtendverzoek niet claimen, accepteren of aan zichzelf
toewijzen. Dat ontbreken is binnen de huidige PoC bedoeld gedrag.

## 10. Activiteitencoördinator

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| COO-01 | `/planning` | Kies vandaag en daarna een andere datum | Weekdag, datum, ochtendblok en middagblok volgen de gekozen datum | |
| COO-02 | `/planning` | Bekijk de beschikbaarheid | Wekelijkse beschikbaarheid minus eenmalige afwezigheid bepaalt de effectieve ochtend- en middagbeschikbaarheid | |
| COO-03 | `/planning` | Bekijk **Patiëntbehoeften vandaag** | Aantallen zijn geaggregeerd uit check-ins voor de geselecteerde datum; **Meest gekozen** is uitsluitend inspiratie | |
| COO-04 | `/planning` | Bekijk ochtendverzoeken | Actieve verzoeken tonen patiëntnaam, kamer indien aanwezig, boodschap/inspiratie en de afgeleide beslisbadges | |
| COO-05 | `/planning` | Bekijk middaginteresse zonder concrete titel | De coördinator ziet de toegestane lijst met patiëntnaam en kamer; dit blijft vrijblijvende interesse, geen inschrijving | |
| COO-06 | `/planning` zonder concreet plan | Leg als coördinator een middagactiviteit vast | Het plan wordt voor de gekozen datum opgeslagen en de compacte samenvatting wordt zichtbaar | |
| COO-07 | `/planning` met bestaand plan | Wijzig de activiteit | Dezelfde dagplanrij wordt bijgewerkt; naam van de laatste bewerker en tijdstip veranderen | |
| COO-08 | `/planning/volunteers` | Wijzig datum en maand | Vrijwilligersprofielen, weekblokken, effectieve status en afwezigheden volgen de selectie; de gegevens zijn alleen-lezen | |

De coördinator plant geen individuele patiënten, wijst geen vrijwilligers toe
en beheert geen capaciteit, tijdsloten, terugkerende series of
activiteitenbibliotheek.

## 11. Patiënt

### 11.1 Startscherm en navigatie

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| PAT-01 | `/dashboard` | Open het dashboard | De begroeting is `Hallo, {voornaam}!` of `Hallo!`; opname-informatie en de echte dagsamenvatting laden | |
| PAT-02 | `/dashboard` | Bekijk de tegels | Check-in, vragen, Zorgcontext en DailyBuddy zijn beschikbaar; de verwijderde weekoverzicht-tegel en een los activiteitenoverzicht ontbreken | |
| PAT-03 | `/dashboard/activities` | Open de oude bookmarkroute | De route leidt naar `/dashboard/advice`; er wordt geen oude activiteitenpagina hersteld | |

### 11.2 Dagelijkse check-in

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| CHK-01 | P2 — `/dashboard/checkin` | Kies **Start check-in** | Het formulier toont pijn, energie, stemming, mobiliteit, participatiebehoeften, motivatie, symptomen en notitie | |
| CHK-02 | Dezelfde route | Selecteer representatieve scores en meerdere behoeften en sla op | De check-in wordt één keer voor vandaag opgeslagen; een samenvatting en link naar DailyBuddy verschijnen | |
| CHK-03 | Dezelfde route | Kies **Bewerken**, wijzig een score of behoefte en sla op | De bestaande check-in wordt bijgewerkt en het DailyBuddy-resultaat mag niet stilzwijgend op de oude brondata blijven staan | |
| CHK-04 | Dezelfde route | Bekijk het historische gedeelte | Beschikbare eerdere check-ins staan op datum met kernscores; de check-in van vandaag wordt niet dubbel getoond | |
| CHK-05 | Na opslaan | Navigeer zonder harde refresh naar DailyBuddy | De applicatie herkent direct dat de check-in bestaat; de oude fout waarbij opnieuw verversen nodig was treedt niet op | |

### 11.3 Patiëntvragen

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| QUE-01 | `/dashboard/questions` | Maak een vraag korter dan vijf tekens | Een validatiefout verschijnt en de vraag wordt niet opgeslagen | |
| QUE-02 | Dezelfde route | Maak een geldige vraag en kies het specialisme | De vraag verschijnt bij **Open vragen** en de open-vragenteller op het dashboard wordt bijgewerkt | |
| QUE-03 | Open vraag | Bewerk tekst of specialisme | De gewijzigde vraag blijft na herladen zichtbaar | |
| QUE-04 | Open vraag | Kies verwijderen, annuleer eerst en bevestig daarna | Annuleren behoudt de vraag; bevestigen verwijdert deze | |
| QUE-05 | Niet-open vraag, indien aanwezig in de testdata | Bekijk de kaart | De vraag staat bij eerdere vragen en is niet meer door de patiënt bewerkbaar of verwijderbaar | |

Vragen worden in de huidige PoC niet door de zorgverlener beantwoord. Een
antwoord- en afhandelworkflow is doorontwikkeling.

### 11.4 Zorgcontext als patiënt

| ID | Route | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| PCTX-01 | `/dashboard/context` | Bekijk de Zorgcontext | Professioneel vastgelegde waarden, volledigheid en wijzigingsinformatie zijn leesbaar | |
| PCTX-02 | Dezelfde route | Zoek naar wijzigingsmogelijkheden | De patiënt kan de Zorgcontext niet bewerken | |
| PCTX-03 | Twee accounts | Wijzig een veld als C1 en bekijk opnieuw als P1 | De patiënt ziet de nieuwe waarde; de bron blijft de zorgverlenersregistratie | |

### 11.5 DailyBuddy-prerequisites en foutpaden

| ID | Scenario | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| DB-01 | P2 zonder check-in | Open `/dashboard/advice` | **Eerst je check-in invullen** met een link naar de check-in; er start geen generatie- of poll-lus | |
| DB-02 | P3 met incomplete essentiële Zorgcontext | Vul de check-in in en open DailyBuddy | **DagBuddy is nog niet beschikbaar**; de patiënt kan de eigen Zorgcontext bekijken, maar niet aanpassen | |
| DB-03 | P4 met begrenzende Zorgcontext | Genereer of open advies | Geen gezamenlijke middagactiviteit of interesseactie wordt aangeboden wanneer de vastgelegde grenzen dat niet toestaan | |
| DB-04 | Gesimuleerde of echte generatiefout | Gebruik **Opnieuw proberen** | De patiënt ziet alleen patiëntveilige fouttekst; interne database-, tool- of modeldetails blijven verborgen | |

### 11.6 DailyBuddy, middaginteresse en streaming

Voor DB-05 tot en met DB-08 mag nog geen concrete activiteitstitel voor vandaag
zijn opgeslagen. Voor DB-09 en verder wordt daarna wel een titel vastgelegd.

| ID | Scenario | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| DB-05 | P1, complete bronnen, titel nog onbekend | Open DailyBuddy | De kaart heet **Middagactiviteit** en legt uit dat de gezamenlijke activiteit plaatsvindt maar later wordt ingevuld; dit wordt niet beschreven als ontbrekend of geannuleerd programma | |
| DB-06 | P1 komt in aanmerking voor vrijblijvende interesse | Bekijk de primaire kaart | **Ik heb mogelijk interesse** is zichtbaar met de uitleg dat dit geen boeking, reservering, garantie of verplichting is | |
| DB-07 | Dezelfde kaart | Toon interesse, trek deze in en toon daarna opnieuw interesse | De status wisselt zonder dubbele signalen voor dezelfde patiënt en datum | |
| DB-08 | O1 en V1 | Controleer dezelfde interesse | O1 ziet de toegestane namen/kamers; V1 ziet alleen het geaggregeerde aantal | |
| DB-09 | V1 of O1 | Leg nu een concrete middagactiviteit met titel vast | De interesseactie verdwijnt uit de patiëntweergave; titel, tijd en patiëntboodschap verschijnen bij de middagactiviteit | |
| DB-10 | P1 | Bewerk de check-in zodat een nieuwe beoordeling nodig is en open DailyBuddy | De zichtbare voortgang doorloopt de stappen die werkelijk worden uitgevoerd: check-in, Zorgcontext, mogelijkheden/activiteiten, samenstellen, valideren en gereed | |
| DB-11 | Tijdens DB-10 | Observeer de voortgang | Geen ruwe klinische waarden, toolresultaten, patiënt-ID’s, vrijwilligersnamen of gedeeltelijk ongevalideerde adviestekst wordt gestreamd | |
| DB-12 | Na DB-10 | Wacht op het resultaat zonder te verversen | De voortgang schakelt vanzelf naar een gereed advies; een late poll zet `ready` niet terug naar `generating` | |
| DB-13 | Gereed advies | Lees titel, motivatie, uitleg en keuzetekst | Het advies gaat over participatie, bevat geen diagnose of behandeling, wijst niemand toe en benadrukt dat de keuze bij de patiënt blijft | |
| DB-14 | Gereed advies | Ververs de pagina | Het geldige opgeslagen advies wordt hergebruikt; alleen verversen start geen nieuwe modelrun | |
| DB-15 | Bronwijziging | Wijzig de check-in of een relevant Zorgcontextveld | Het oude advies wordt niet als actueel gepresenteerd; de nieuwe generatie gebruikt de gewijzigde bron | |
| DB-16 | Bestaande generatie in een andere tab | Open DailyBuddy in een tweede tab | Er ontstaat geen dubbele run; de tweede tab mag beperkt pollen tot de bestaande generation claim gereed is | |

Een deterministisch beleidspad kan terecht minder voortgangsstappen tonen dan
het LLM-pad. De interface mag nooit doen alsof een tool of modelstap is
uitgevoerd wanneer die stap niet nodig was.

### 11.7 Optioneel ochtendverzoek

Deze actie verschijnt alleen wanneer DailyBuddy op basis van de huidige
check-in, Zorgcontext en beschikbaarheid een persoonlijk ochtendbezoek als
hoofd- of secundaire mogelijkheid mag tonen.

| ID | Rol | Handeling | Verwacht zichtbaar resultaat | Status |
|---|---|---|---|---|
| VIS-01 | Patiënt | Kies maximaal vier inspiratie-items, voeg optioneel een korte boodschap toe en dien het verzoek in | Het verzoek wordt bevestigd als eenvoudig verzoek; er wordt geen vrijwilliger toegewezen of komst gegarandeerd | |
| VIS-02 | Vrijwilliger | Open `/volunteer` voor dezelfde datum | Naam, kamer indien aanwezig, boodschap en inspiratie zijn zichtbaar; relevante afgeleide badges kunnen aangeven dat afdelingsbezoek extra waardevol is of bescherming nodig is | |
| VIS-03 | Coördinator | Open `/planning` voor dezelfde datum | Hetzelfde actieve ochtendverzoek staat in de toegestane coördinatorlijst | |
| VIS-04 | Patiënt | Trek het verzoek in | De patiënt ziet de bevestiging; het verzoek verdwijnt uit de actieve lijsten | |
| VIS-05 | Vrijwilliger/coördinator | Zoek naar accepteren, claimen of toewijzen | Zo’n actie bestaat niet in deze PoC | |

## 12. Autorisatie en gegevensisolatie

Gebruik voor deze controles verschillende browsers, profielen of
incognitovensters zodat sessies niet door elkaar lopen.

| ID | Handeling | Verwacht resultaat | Status |
|---|---|---|---|
| SEC-01 | Open `/care` en `/admin` als patiënt | Toegang wordt geweigerd of naar een toegestane route omgeleid | |
| SEC-02 | Open `/admin` als zorgverlener zonder adminrol | Geen toegang | |
| SEC-03 | Open `/care` of `/admin` als vrijwilliger zonder die rollen | Geen toegang | |
| SEC-04 | Open `/care` of `/admin` als coördinator zonder die rollen | Geen toegang | |
| SEC-05 | Open een patiëntgebonden route als een ander patiëntaccount | Er wordt geen check-in, vraag, Zorgcontext of DailyBuddy-advies van de andere patiënt getoond | |
| SEC-06 | Probeer als patiënt Zorgcontext of opgeslagen DailyBuddy-output te wijzigen | De UI biedt dit niet aan en de databasebeveiliging weigert een ongeoorloofde write | |
| SEC-07 | Vergelijk middaginteresse bij coördinator en vrijwilliger | De coördinator mag toegestane namen/kamers zien; de vrijwilliger alleen een telling | |
| SEC-08 | Gebruik een roltegel op het Demonstratie-overzicht met de verkeerde rol | De doelroute blijft beveiligd; de tegel is alleen navigatie | |

Leg voor de presentatie bij één van deze tests kort uit dat RLS de
gegevensisolatie afdwingt en dat de browser geen patiënt-ID aan DailyBuddy mag
meegeven om een andere patiënt te selecteren.

## 13. Legacyroutes en verwijderde UI

| ID | Controle | Verwacht resultaat | Status |
|---|---|---|---|
| LEG-01 | `/dashboard/activities` | Redirect naar `/dashboard/advice` | |
| LEG-02 | Verwijderde complexe `/planning/*`-routes, zoals `/planning/calendar` of `/planning/activities` | Redirect naar `/planning` wanneer de compatibiliteitsredirect van toepassing is | |
| LEG-03 | `/care/activities` | Redirect naar `/care` | |
| LEG-04 | Patiëntdashboard | Geen weekoverzicht-tegel en geen algemeen activiteitenoverzicht | |
| LEG-05 | Zorgverlenersnavigatie | Geen Meldingen, Instellingen, fake badge of uitgeschakeld zoekveld | |
| LEG-06 | Zorgverlenertabel | Geen permanent lege kolommen voor Check-in of Vragen | |
| LEG-07 | Coördinatornavigatie | Geen uitgeschakeld zoekveld | |
| LEG-08 | DailyBuddy | Geen ontwikkelknop of paneel voor handmatige prompt-/adviesiteraties | |
| LEG-09 | Beheernavigatie | Geen Afdelingen-item | |

## 14. Responsive en visuele eindcontrole

Voer deze tests minimaal uit op een desktopbreedte en een tabletbreedte.
Controleer de patiëntweergave aanvullend op een smalle mobiele breedte.

| ID | Controle | Verwacht resultaat | Status |
|---|---|---|---|
| UI-01 | Korte en lange patiëntpagina | De laatste kaart eindigt niet flush tegen de onderrand | |
| UI-02 | Lange zorgverlenerspagina en brede patiënttabel | Er is zichtbare onderruimte; horizontaal scrollen van de tabel veroorzaakt geen tweede verticale scrollbar | |
| UI-03 | Coördinatorpagina met lang dagoverzicht | De werkelijke scrollcontainer heeft onderruimte en header/sidebar blijven correct werken | |
| UI-04 | Vrijwilligersbeschikbaarheid en dagoverzicht | De laatste kaart houdt onderruimte en formulieronderdelen blijven tabletvriendelijk | |
| UI-05 | Beheerpagina met tabel | Tabel en filters blijven bruikbaar zonder overlappende randen of afgesneden acties | |
| UI-06 | Alle rollen | Hartlogo, navigatie, uitloggen en actieve navigatiestatus blijven zichtbaar en bruikbaar | |

## 15. Bewuste PoC-beperkingen

De volgende punten zijn geen actieve functionaliteiten en mogen daarom niet als
mislukte test worden geregistreerd.

| Niet geïmplementeerd | Huidige grens |
|---|---|
| Zorgverlener leest check-ins | Mogelijke doorontwikkeling: eerst alleen-lezen inzage |
| Zorgverlener leest of beantwoordt vragen | Mogelijke doorontwikkeling: alleen-lezen inzage, daarna beveiligd antwoorden en afhandelstatus |
| Afdelingsbeheer en afdelingsfiltering | Afdelingsgegevens kunnen nog als opname-/locatiegegeven bestaan, maar er is geen actieve beheermodule of afdelingstoewijzing voor medewerkers |
| Algemeen patiëntenactiviteitenoverzicht | Participatiemogelijkheden worden binnen DailyBuddy en de dagelijkse flow getoond |
| Weekoverzicht patiënt | De oude tegel is verwijderd |
| Meldingen en instellingen zorgverlener | Niet geïmplementeerd |
| Algemeen zoeken in zorg en planning | Uitgeschakelde zoekvelden zijn verwijderd; alleen echte beheerzoekfuncties blijven |
| QuestionBuddy | Patiëntvragen zijn deterministische CRUD; de AI-samenvatting is toekomstwerk |
| Individuele planning of matching | Geen minutenplanning, patiënt-vrijwilligertoewijzing of automatische matching |
| Claim of bevestiging van ochtendbezoek | Een verzoek is zichtbaar, maar kan niet in de app worden geaccepteerd |
| Definitieve inschrijving middagactiviteit | Interesse is niet-bindend en is geen reservering |
| Capaciteitshandhaving | De getoonde capaciteit is niet database-technisch afgedwongen |
| Volledig rooster of activiteitenbibliotheek | De PoC gebruikt twee vaste dagblokken en één dagelijkse middagcommunicatie |
| Medisch advies | DailyBuddy ondersteunt participatie en overschrijft de professionele Zorgcontext niet |

## 16. Korte demonstratieroute voor de eindpresentatie

Deze route is niet de volledige regressietest. Zij selecteert het bewijs dat
binnen de voorgeschreven 8–12 minuten het meest overtuigend is.

| Tijd | Onderdeel | Te tonen bewijs |
|---|---|---|
| 0:00–0:45 | Project lokaal | Startcommando en globale mappenstructuur: routes, componenten, services, AI-tools en migraties |
| 0:45–2:00 | Supabase | Tabellen en relaties, RLS aan, één admission-scoped policy en waarom patiënt B data van patiënt A niet kan lezen |
| 2:00–2:45 | Productie en auth | Vercel-URL, Demonstratie-overzicht, login en rolredirect |
| 2:45–4:00 | Zorgcontext | Zorgverlener wijzigt één relevant veld; patiënt ziet dit alleen-lezen |
| 4:00–5:15 | Check-in | Patiënt vult scores en participatiebehoefte in; toon tevens één invoervalidatie |
| 5:15–7:30 | DailyBuddy | Open zonder harde refresh, toon echte voortgang, vier databronnen, eindadvies en patiëntautonomie |
| 7:30–8:30 | Participatieactie | Toon mogelijke middaginteresse of ochtendverzoek en de passende coördinator-/vrijwilligersweergave |
| 8:30–9:30 | Aanvullende CRUD | Maak en bewerk kort een patiëntvraag, of toon vrijwilligersbeschikbaarheid |
| 9:30–10:30 | Beveiliging | Patiënt probeert `/care` of `/admin`; leg RLS en routeguard kort uit |
| 10:30–11:30 | Foutpad en afronding | Toon prerequisite bij ontbrekende check-in/incomplete Zorgcontext of de patiëntveilige retry-state |

Voor DailyBuddy is het sterkste bewijs:

1. de patiëntinput is zichtbaar;
2. de voortgang correspondeert met echte serverstappen;
3. het resultaat combineert check-in, Zorgcontext, dagplan en
   beschikbaarheidssignaal;
4. de uitkomst blijft niet-medisch en binnen vastgelegde grenzen;
5. een fout of ontbrekende voorwaarde leidt tot een veilige, herstelbare
   toestand.

## 17. Eindregistratie

| Testgroep | Geslaagd | Mislukt | N.v.t./niet uitgevoerd | Bewijs of issue |
|---|---:|---:|---:|---|
| Technische preflight | | | | |
| Demonstratie-overzicht en auth | | | | |
| Beheerder | | | | |
| Zorgverlener en Zorgcontext | | | | |
| Vrijwilliger | | | | |
| Activiteitencoördinator | | | | |
| Patiënt: check-in en vragen | | | | |
| DailyBuddy en participatieacties | | | | |
| Autorisatie en isolatie | | | | |
| Legacyroutes en verwijderde UI | | | | |
| Responsive eindcontrole | | | | |

### Openstaande bevindingen

| ID | Ernst | Beschrijving | Reproductiestappen | Besluit |
|---|---|---|---|---|
| | ☐ blokkerend ☐ belangrijk ☐ cosmetisch | | | |
| | ☐ blokkerend ☐ belangrijk ☐ cosmetisch | | | |

### Vrijgavebesluit

- ☐ Alle vier kernfunctionaliteiten zijn aantoonbaar werkend.
- ☐ Minstens één foutpad is zichtbaar en veilig afgehandeld.
- ☐ De rol- en patiëntisolatie is gecontroleerd.
- ☐ De Vercel-deployment hoort bij de geteste commit.
- ☐ Alleen fictieve gegevens zijn gebruikt.
- ☐ Blokkerende bevindingen zijn opgelost of de applicatie is niet vrijgegeven.
