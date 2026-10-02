# Catalog expansion draft — for review

**Status: approved by the author on 2026-10-02, as drafted.** All items ship; the ➖ and ✂️ markers were never applied. One item was later dropped by the batch validator: `toys/sounding`, which already exists in the catalog as a role-specific kink.

Proposed batch of **179 new kinks** across 3 new categories and 18 existing ones. This document exists to be cut and reworded. Mark rows with ✂️ to remove, edit any label freely.

Review notes:

- Labels are drafted in **English and Dutch**. Dutch is the source locale (ADR 0001); final nl wording is the author's call. Auto-translation is dropped per the same decision.
- **Dedup**: 15 of the original 195 proposals collided with existing catalog ids and were removed, and a 16th (`toys/sounding`) was caught later by the batch validator. The add-kinks script re-validates id uniqueness at insert time and the review report flags near-duplicate wording.
- **Format legend**: `G` = general (one rating). `RS` = role_specific, default all four positions (`as_dom`, `for_sub`, `as_sub`, `for_dom`); deviations noted inline.
- Every accepted item gets `addedAt` = batch release date and the next free sequential key (from 302).
- ⚠️ **Open question for the author**: the batch is currently 103 RS / 77 G (**57% RS**). The existing catalog is 119 RS / 60 G (66%). The agreed target in planning was 30–40% RS. Either consciously accept the higher share, or trim/convert ~35 RS items (candidates marked ➖ below).

## Summary

| Area | New items |
|---|---|
| aftercare (new category) | 10 |
| communication (new category) | 12 |
| service_ritual (new category) | 12 |
| bodies | 8 |
| clothing | 10 |
| general | 16 |
| ass_play | 8 |
| restrictive | 7 |
| toys | 11 |
| domination | 11 |
| no_consent | 6 |
| taboo | 8 |
| surrealism | 5 |
| fluids | 7 |
| degradation | 9 |
| touch_stimulation | 6 |
| misc_fetish | 10 |
| pain | 8 |
| medium | 4 |
| time_scale | 5 |
| role_play | 6 |
| **Total** | **179 (103 RS / 76 G)** |

## Known catalog issues (found during dedup, fix separately)

- `double_penetration` exists **twice** in `src/data/kinks.ts` (same id, two entries). Ids must be unique; one needs renaming. Keys and share links are unaffected (they use `key`).
- Comment in `src/types/index.ts` claims selections format is `categoryId_kinkId_position`, but the code uses `key%position`. Documentation-only fix.

## New categories

- **aftercare** — Care and connection after intense play.
- **communication** — Negotiation, consent practices, checking in.
- **service_ritual** — Acts of service and formalized rituals of dominance and submission.

---

## aftercare

| id | EN | NL | fmt |
|---|---|---|---|
| water_snacks | Water and snacks afterwards | Water en snacks achteraf | G |
| cuddling_after | Cuddling after play | Knuffelen na afloop | G |
| blanket_comfort | Blankets and comfort afterwards | Dekens en geborgenheid achteraf | G |
| debrief_talk | Talking through the scene afterwards | De sessie achteraf bespreken | G |
| praise_aftercare | Praise and reassurance afterwards | Lof en geruststelling achteraf | G |
| quiet_time_together | Quiet time together afterwards | Stille tijd samen achteraf | G |
| bathing_together_after | Bathing or showering together afterwards | Samen baden of douchen achteraf | G |
| next_day_check_in | Checking in the next day | De dag erna navragen hoe het ging | G |
| tending_marks | Tending to marks and bruises | Verzorgen van merktekens | G |
| alone_time_after | Alone time to process afterwards | Alleen-tijd om het te verwerken | G |

## communication

| id | EN | NL | fmt |
|---|---|---|---|
| safeword_stoplight | Traffic-light safeword system | Stoplicht-systeem voor safewoorden | RS |
| nonverbal_signals | Non-verbal stop signals | Non-verbale stopsignalen | RS |
| mid_scene_check_ins | Check-ins during a scene | Check-ins tijdens een sessie | RS |
| pre_scene_negotiation | Negotiating a scene in advance | Vooraf een sessie onderhandelen | RS |
| hard_limits_talk | Discussing hard limits | Harde grenzen bespreken | RS |
| soft_limits_talk | Discussing soft limits | Zachte grenzen bespreken | RS |
| post_scene_feedback | Honest feedback after a scene | Eerlijke feedback na een sessie | RS |
| limits_revisited | Revisiting limits over time | Grenzen na verloop van tijd herzien | RS |
| explicit_consent_asking | Explicitly asking for consent | Expliciet om toestemming vragen | RS |
| consent_retraction | Withdrawing consent mid-scene | Toestemming onderweg intrekken | RS |
| sexting_consent | Explicit consent in sexting | Expliciete toestemming bij sexting | RS |
| shared_wishlist | Making a shared wishlist together | Samen een wensenlijst maken | G |

## service_ritual

| id | EN | NL | fmt |
|---|---|---|---|
| daily_collar | Wearing a collar daily | Dagelijks een halsband dragen | RS |
| kneeling_greeting | Kneeling as a greeting | Knielen als begroeting | RS |
| drink_service | Serving drinks on command | Drankjes serveren op commando | RS |
| personal_tasks | Personal tasks and assignments | Persoonlijke taken en opdrachten | RS |
| outfit_approval | Needing approval for outfits | Goedkeuring vragen voor kleding | RS |
| chore_protocol | Formalized household protocol | Vast huishoudprotocol | RS |
| permission_to_speak | Asking permission to speak | Toestemming vragen om te spreken | RS |
| nightly_report | Reporting back every evening | Elke avond verslag doen | RS |
| public_insignia | Wearing a hidden token in public | Onzichtbaar teken dragen buitenshuis | RS |
| ritual_greeting | A fixed greeting ritual | Vast begroetingsritueel | RS |
| service_others_present | Serving while others are present | Serveren terwijl anderen erbij zijn | RS |
| ownership_rituals | Rituals of ownership | Rituelen van eigendom | RS |

## bodies

| id | EN | NL | fmt |
|---|---|---|---|
| tattoos | Tattoos | Tatoeages | G |
| piercings | Piercings | Piercings | G |
| muscular_bodies | Muscular bodies | Gespierde lichamen | G |
| hairy_bodies | Body hair | Lichaamsbeharing | G |
| smooth_bodies | Smooth/shaved bodies | Gladde/gepiloserde lichamen | G |
| tall_partners | Tall partners | Lange partners | G |
| short_partners | Short partners | Kleine partners | G |
| grey_hair | Grey hair / silver foxes | Grijs haar / zilvervosjes | G |

## clothing

| id | EN | NL | fmt |
|---|---|---|---|
| latex_outfits | Full latex outfits | Volledige latex outfits | G |
| rubber_gear | Rubber gear | Rubberen kleding | G |
| corsets | Corsets | Korsetten | G |
| garter_belts | Garter belts | Jarretellen | G |
| leather_harness_wear | Wearing leather harnesses | Leren harnassen dragen | G |
| nylon_tights | Nylon tights and pantyhose | Nylonkousen en panty's | G |
| only_an_apron | Nothing but an apron | Niets dan een schort | G |
| only_jewelry | Nothing but jewelry | Niets dan sieraden | G |
| swapped_underwear | Wearing each other's underwear | Elkaars ondergoed dragen | G |
| business_attire | Formal business attire | Strikt zakelijke kleding | G |

## general

| id | EN | NL | fmt |
|---|---|---|---|
| deep_kissing | Deep, passionate kissing | Diepe, hartstochtelijke zoenen | G |
| hair_pulling ➖ | Hair pulling | Aan haar trekken | RS |
| marking_hickies ➖ | Leaving hickeys and marks | Merktekens en zuigplekken achterlaten | RS |
| ruined_orgasms | Ruined orgasms | Vernielde orgasmes | RS |
| mutual_masturbation | Mutual masturbation | Samen masturberen | G |
| watching_partner_self ➖ | Watching my partner touch themselves | Toezien hoe de partner zichzelf verwent | RS |
| thigh_fucking | Thigh fucking | Vrijen tussen de dijen | G |
| frottage_grinding | Frottage and grinding | Wrijving en tegen elkaar bewegen | G |
| nipple_play | Focused nipple play | Gerichte tepelstimulatie | RS |
| breast_worship | Breast worship | Borsten aanbidden | RS |
| finger_sucking | Sucking fingers | Vingers zuigen | G |
| neck_kissing | Kissing and nibbling the neck | De nek kussen en knabbelen | G |
| dirty_whispering | Whispering dirty things | Vuile dingen toefluisteren | RS |
| guided_masturbation | Instructed masturbation | Instructies geven bij masturbatie | RS |
| strip_tease | Slow strip teases | Trage stripteases | RS |
| kissing_gentle | Gentle, tender kissing | Teder en zacht kussen | G |

## ass_play

| id | EN | NL | fmt |
|---|---|---|---|
| anal_fingering | Anal fingering | Anaal vingeren | RS |
| anal_beads | Anal beads | Anaalkralen | RS |
| plug_wearing_public | Wearing a plug in public | Een plug dragen buitenshuis | RS |
| plug_24h | Long-term plug wearing | Langdurig een plug dragen | RS |
| pegging | Pegging | Peggen | RS |
| prostate_massage | Prostate massage | Prostatamassage | RS |
| anal_training | Gradual anal training | Geleidelijke anale training | RS |
| anal_enema_prep | Enemas as preparation | Klysma's als voorbereiding | RS |

## restrictive

| id | EN | NL | fmt |
|---|---|---|---|
| shibari_aesthetic | Aesthetic rope work (shibari) | Esthetisch touwwerk (shibari) | G |
| rope_harness_daywear | Wearing a rope harness under clothes | Een touwharnas onder kleding dragen | G |
| armbinder | Armbinders | Armbinders | G |
| mummification_wrap | Mummification with wrap | Inwikkelen met folie/windsels | G |
| cage_time | Time in a cage | Tijd in een kooi | RS |
| furniture_as_restraint | Tied to furniture | Aan meubels vastgebonden | G |
| predicament_bondage | Predicament bondage | Predicament-bondage | G |

## toys

| id | EN | NL | fmt |
|---|---|---|---|
| wand_vibrator | Wand vibrators | Wandvibrators | G |
| vibrating_panties_public | Remote-controlled toys in public | Afstandbaar speelgoed buitenshuis | RS |
| electro_estim | Electrostimulation | Elektrostimulatie | G |
| fucking_machine | Fucking machines | F*ckmachines | G |
| sybian_ride | Sybian-style ride machines | Sybian-achtige machines | G |
| suction_toys | Suction toys for clit/nipples | Zuigspeelgoed voor clit/tepels | G |
| glass_dildos | Glass dildos | Glazen dildo's | G |
| metal_plugs | Steel plugs (temperature play) | Stalen plugs (temperatuurspel) | G |
| dildo_gag | Dildo gag for face use | Gezichtsgordel met dildo | RS |
| double_penetration_toys | DP with toys on one person | DP met speelgoed bij één persoon | RS |
| toy_rotation | A toy box where dom picks | Een speelgoedkist waar de dom kiest | RS |

## domination

| id | EN | NL | fmt |
|---|---|---|---|
| verbal_commands | Giving verbal commands | Verbale bevelen geven | RS |
| protocol_positions | Fixed positions (kneel, present) | Vaste houdingen (knielen, aanbieden) | RS |
| eye_contact_rules | Rules about eye contact | Regels over oogcontact | RS |
| silent_time_rule | Periods of required silence | Verplichte stilteperiodes | RS |
| orgasm_control | Controlling when the sub comes | Bepalen wanneer de sub klaarkomt | RS |
| orgasm_denial_play | Denial and teasing | Ontneming en plagen | RS |
| chastity_enforcement | Enforcing chastity | Kuisheid afdwingen | RS |
| brat_taming | Taming brats | Bratten temmen | RS |
| instant_obedience | Expecting instant obedience | Onmiddellijke gehoorzaamheid eisen | RS |
| title_usage | Using titles (Sir, Miss) | Titels gebruiken (Sir, Mevrouw) | RS |
| public_subtle_control | Subtle control signals in public | Subtiele beheersignalen in het openbaar | RS |

## no_consent

All framed as consensual non-consent between negotiating adults.

| id | EN | NL | fmt |
|---|---|---|---|
| cnc_framework | Consensual non-consent as a frame | Consensuele non-consent als kader | RS |
| resistance_fantasy | Struggle and resistance play | Verzet en tegenstribbelen | RS |
| pretend_blackmail | Blackmail fantasy scenes | Chantagescenario's (fantasie) | RS |
| abduction_scene | Abduction fantasy scenes | Ontvoeringsfantasieën (fantasie) | RS |
| sleeping_partner | Sleeping-partner fantasy | Fantasie over een slapende partner | RS |
| intruder_scene | Intruder/home invasion scene | Indringerscenario (fantasie) | RS |

## taboo

All framed as role-play between adults.

| id | EN | NL | fmt |
|---|---|---|---|
| teacher_student | Teacher/student role-play | Leraar/student rollenspel | RS |
| doctor_patient | Doctor/patient role-play | Dokter/patiënt rollenspel | RS |
| priest_confession | Priest/confession role-play | Priester/biecht rollenspel | RS |
| step_family_fantasy | Step-family role-play (adults, unrelated) | Stiefgezin-rollenspel (volwassenen) | RS |
| boss_employee | Boss/employee role-play | Baas/werknemer rollenspel | RS |
| babysitter_fantasy | Babysitter role-play (adults) | Babysitter-rollenspel (volwassenen) | RS |
| stranger_pickup | Strangers hooking up | Vreemden die met elkaar naar bed gaan | RS |
| age_play_adults | Adult age regression play | Leeftijdsregressie onder volwassenen | RS |

## surrealism

| id | EN | NL | fmt |
|---|---|---|---|
| tentacle_fantasy | Tentacle fantasies | Tentakelfantasieën | G |
| monster_lover | Monster romance scenarios | Monsterroman-scenario's | G |
| alien_abduction | Alien abduction play | Ontvoering door aliens | G |
| giantess_macro | Size difference (giant/tiny) | Grootteverschil (reus/klein) | G |
| shrinking_micro | Shrinking fantasies | Krimpfantasieën | G |

## fluids

| id | EN | NL | fmt |
|---|---|---|---|
| spit_play | Spit play | Spugen en speeksel | RS |
| golden_shower | Golden showers | Gouden douches | RS |
| tears_from_pain | Tears during play | Tranen tijdens een sessie | G |
| drool_play | Drool and gagging | Kwijlen en kokhalzen | RS |
| sweat_worship | Sweat and body scent worship | Zweet en lichaamsgeur aanbidden | G |
| breast_milk | Lactation and breast milk | Lactatie en borstvoeding | G |
| cum_marks | Cum as marking | Zaad als merkteken | RS |

## degradation

| id | EN | NL | fmt |
|---|---|---|---|
| name_calling_scene | Degrading names (negotiated) | Vernederende namen (afgesproken) | RS |
| objectification | Being used as an object | Als voorwerp gebruikt worden | RS |
| human_furniture | Human furniture | Menselijk meubel zijn | RS |
| public_humiliation_scene | Humiliation in front of others | Vernedering voor anderen | RS |
| verbal_humiliation_scene | Verbal humiliation scenes | Verbale vernedering | RS |
| small_penis_humiliation | Small penis humiliation | Vernedering om kleine penis | RS |
| body_insults_negotiated | Insults about the body (negotiated) | Beledigingen over het lichaam (afgesproken) | RS |
| degrading_tasks | Degrading tasks and chores | Vernederende taken en klusjes | RS |
| being_ignored | Being deliberately ignored | Bewust genegeerd worden | G |

## touch_stimulation

| id | EN | NL | fmt |
|---|---|---|---|
| wax_dripping | Dripping wax | Was druppelen | RS |
| scratching_back | Scratching and clawing | Krassen en klauwen | RS |
| tingling_balm | Tingling balms (mint/ginger) | Tintelende balsems (munt/gember) | RS |
| temperature_contrast | Contrasting hot and cold | Wisselen tussen warm en koud | RS |
| long_slow_strokes | Long, slow full-body strokes | Langzame strijkingen over het hele lijf | G |
| fingertip_teasing | Fingertip teasing | Treiteren met vingertoppen | RS |

## misc_fetish

| id | EN | NL | fmt |
|---|---|---|---|
| feet_massage | Feet: massage and touch | Voeten: massage en aanraken | G |
| shoe_worship | Shoe worship | Schoenen aanbidden | RS |
| armpit_play | Armpits | Oksels | G |
| hands_fetish | Hands and fingers | Handen en vingers | G |
| glasses_fetish | Glasses | Brillen | G |
| braces_fetish | Dental braces | Beugels | G |
| voice_fetish | Voices, whispering, ASMR | Stemmen, gefluister, ASMR | G |
| loud_moaning | Loud, uninhibited moaning | Luid en ongepotentgierd kreunen | G |
| body_scent | Natural body scent | Natuurlijke lichaamsgeur | G |
| belly_touch | Bellies and soft midsections | Buiken en zachte middelen | G |

## pain

| id | EN | NL | fmt |
|---|---|---|---|
| single_tail | Single-tail whips | Eénstaartige zwepen | RS |
| paddle_spanking | Paddles | Peddels | RS |
| belt_whipping | Belts | Riemen | RS |
| wooden_spoon | Wooden spoons | Houten lepels | RS |
| chest_slapping | Chest and breast slapping | Op borst en tepels slaan | RS |
| ball_busting | Ball busting | Ballbusting | RS |
| hard_nipple_pinching | Hard nipple pinching/twisting | Stevig tepels knijpen/draaien | RS |
| bruise_counting | Wearing bruises proudly | Trots blauwe plekken dragen | G |

## medium

| id | EN | NL | fmt |
|---|---|---|---|
| under_mattress_restraints | Under-mattress restraint kits | Restraint-sets onder de matras | G |
| door_frame_restraints | Door-frame restraints | Deurstel-restraints | G |
| wall_mounts | Wall and ceiling mounts | Muur- en plafondbevestigingen | G |
| dining_table_scene | Everyday furniture as a scene stage | Gewone meubels als toneel | G |

## time_scale

| id | EN | NL | fmt |
|---|---|---|---|
| quickie_scene | Short, intense scenes | Korte, intense sessies | G |
| marathon_sessions | Multi-hour marathon sessions | Urenlange sessies | G |
| weekend_scene | Weekend-long dynamics | Dynamiek die een heel weekend duurt | G |
| tpe_247 | 24/7 total power exchange | 24/7 totale machtsuitwisseling | RS |
| denial_weeks | Denial lasting days or weeks | Ontneming die dagen of weken duurt | RS |

## role_play

| id | EN | NL | fmt |
|---|---|---|---|
| police_arrest | Police arrest role-play | Politie-arrestatie rollenspel | RS |
| interrogation_scene | Interrogation scene | Verhoorscenario | RS |
| dungeon_master | Dungeon master and captive | Meester van de kelder en gevangene | RS |
| photographer_scene | Photographer and model | Fotograaf en model | RS |
| royal_servant | Royalty and servant | Vorst en dienaar | RS |
| vampire_bite | Vampire biting scenes | Vampierbijt-scenario's | RS |
