export const DAILYBUDDY_COPY = {
  generationFailed: {
    title: "Het advies kon niet worden gemaakt.",
    description:
      "Het advies kon op dit moment niet worden gemaakt. Probeer het later opnieuw.",
    retryHint: "Je check-in is wel opgeslagen. Probeer het opnieuw.",
  },
  checkinRequired: {
    title: "Eerst je check-in invullen",
    description:
      "DagBuddy maakt persoonlijk advies nadat je de check-in van vandaag hebt afgerond.",
    actionLabel: "Naar check-in",
    href: "/dashboard/checkin",
  },
  careContextIncomplete: {
    title: "DagBuddy is nog niet beschikbaar",
    description:
      "Je zorgteam moet eerst de nodige zorgcontext invullen voordat DagBuddy veilig advies kan maken. Neem contact op met je zorgverlener als je vragen hebt.",
    secondaryActionLabel: "Bekijk je zorgcontext",
    secondaryHref: "/dashboard/context",
  },

  dayAdvice: {
    eyebrow: "Advies voor vandaag",
    fallbackTitle: "Advies voor vandaag",
    afternoonPrimaryTitle:
      "Mijn advies voor vandaag: een gezamenlijke middagactiviteit",
  },
  afternoonActivity: {
    title: "Middagactiviteit",
    complementaryIntro:
      "Hier kun je aangeven of je mogelijk wilt meedoen, of de bekende activiteit bekijken.",
    knownActivityIntro:
      "Hier zie je de bekende middagactiviteit. Je kunt nog aangeven of je mogelijk interesse hebt.",
    knownActivityWithInterestIntro:
      "Hier zie je de bekende middagactiviteit. Je kunt je interessesignaal nog intrekken.",
    description:
      "Vanmiddag is er een gezamenlijke activiteit. De exacte invulling kan later vandaag bekend worden en mag meegroeien met de interesses van deelnemers.",
    disclaimer:
      "Mogelijke interesse is geen inschrijving, geen reservering en geen verplichting om te komen.",
    expressLabel: "Ik heb mogelijk interesse",
    withdrawLabel: "Interesse intrekken",
    expressedLabel:
      "Je hebt aangegeven dat je mogelijk interesse hebt (niet bindend).",
    timeLabel: "Middag",
  },
  morningVisit: {
    title: "Bezoek op de afdeling",
    secondaryTitle: "Liever op de afdeling blijven?",
    description:
      "Een vrijwilliger kan je in de ochtend persoonlijk op de afdeling bezoeken.",
    secondaryDescription:
      "Je kunt ook een bezoek op de afdeling aanvragen. Een vrijwilliger kan je in de ochtend persoonlijk bezoeken.",
    clarification:
      "Deze mogelijkheid is vooral bedoeld voor patiënten die niet aan een activiteit buiten de afdeling kunnen deelnemen.",
    requestLabel: "Bezoek aanvragen",
    requestPendingLabel: "Bezig...",
    cancelLabel: "Bezoek annuleren",
    messageLabel: "Korte boodschap (optioneel)",
    messagePlaceholder: "Bijvoorbeeld: graag een rustig praatje.",
    requestSuccess: "Je bezoekaanvraag is verstuurd naar het vrijwilligersteam.",
    cancelSuccess: "Je bezoekaanvraag is geannuleerd.",
    requestFailed: "Bezoekaanvraag mislukt.",
    cancelFailed: "Annuleren mislukt.",
    existingRequestPrefix: "Je hebt vandaag een bezoekaanvraag staan",
  },
} as const;
