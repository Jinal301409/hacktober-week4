import { SavedStory } from '../types';

export const SAMPLE_STORIES: SavedStory[] = [
  {
    id: 'demo-sample-1',
    title: 'The Cartographer of Magnetic Tape',
    content: `The card catalogue in the basement of the St. Jude Archive had not been updated since the blizzard of 1978. In drawer 41-C, wedged between treatises on maritime law and watermarked maps of lost canals, Clara discovered a spool of half-inch magnetic tape labeled only with a coordinate and a date: 42°19'N, 71°04'W — October 31, 1984.

She threaded the reel onto the museum's hulking Otari deck. When she threw the switch, the motors did not scream as expected; they turned with a heavy, oiled hum, like a lung drawing breath after decades beneath silt.

At first, there was only tape hiss—the quiet snowfall of old iron oxide scraping against the playback head. But as the vu meters twitched, a voice began to filter through the static. It was not speaking in words, but in sequence: room numbers, floor dimensions, and the names of scholars who had died in their sleep in the reading rooms above.

"Third floor," the voice whispered, measured and serene. "Alcove twelve. Behind the spine of Burton's Anatomy. A brass key is taped beneath the walnut shelf. Someone will need it when the storm arrives again."

Clara took the service elevator to the third floor. The carpet smelled of wool and centuries of dried paste. She reached into Alcove 12, ran her fingers along the underside of the walnut board, and felt the chill of tarnished brass. As her fingernail caught the edge of the cellophane tape, the overhead fluorescent bulbs flickered once, in rhythm with the tape player spinning three floors below.

The key was cold. In the dim silence between the book stacks, a soft tap echoed from the wall intercom—a unit disconnected during the Carter administration. Three rhythmic clicks. Then the carrier wave died.`,
    setting: 'Abandoned Archive Basement',
    atmosphere: 'eerie',
    character: 'Relic Archivist Clara Sterling',
    theme: 'Forgotten Memories in Magnetic Tape',
    date: '1984-10-31',
    notes: 'Preserved sample chronicle illustrating tech-gothic archival storytelling.',
    modelUsed: 'qwen2.5:3b (Offline Archive Sample)',
    tags: ['magnetic-tape', 'archive', 'haunted-audio', 'demo'],
    wordCount: 298,
    isDemo: true,
  },
  {
    id: 'demo-sample-2',
    title: 'The 4:04 A.M. Carrier Signal',
    content: `Every night at precisely four minutes past four, the green monochrome monitor inside Substation 9 would awaken. The substation had been decommissioned after the reservoir flooded the river valley in 1963, leaving only the brick generator shack perched on the granite bluffs above the dark water.

Julian, a network engineer monitoring microwave relays for the county, had climbed the bluff on a dare. The generator shack was cold enough to frost his breath, but the transformer beneath the floorboards vibrated with a faint, steady sixty-cycle purr.

On the amber phosphor CRT screen, green scanlines traced a single line of text:
\`SECTOR 4: SPILLWAY SLUICE 2 AT CAPACITY. PLEASE CONFIRM DRAINAGE.\`

The keyboard was an antique mechanical board with thick grey keycaps and a coiled grey cable leading directly into a cast-iron conduit in the wall. Julian wiped a film of river silt from the keys and typed:
\`WHO IS ON THIS CIRCUIT?\`

The machine paused for three clock cycles. The floppy disk drive—a five-and-a-quarter-inch drive with an unlabelled black diskette—chattered like teeth in cold weather.

The response crawled onto the phosphor:
\`I AM ARTHUR PENDLETON. SHIFT SUPERVISOR, THIRD WATCH. THE RAIN HAS NOT STOPPED SINCE NOVEMBER. PLEASE OPEN THE FLOODGATES. MY CHILDREN ARE SLEEPING IN THE LOWER QUARTERS.\`

Julian stared at the screen. He pulled out his phone and searched the county historical registry. Arthur Pendleton was the last shift engineer at Substation 9. He had drowned in the basement turbine pit on November 14, 1963, holding a manual valve open so three technicians could escape the backflow.

Julian's fingers hovered over the keyboard. He typed:
\`ARTHUR. THE GATES OPENED SIXTY YEARS AGO. YOUR CHILDREN GREW OLD. THEY ARE SAFE.\`

For nearly a minute, no sound stirred the cabin except the wind through the cracked window panes. Then the green CRT gave a single gentle crackle of static. The line of text cleared itself. A final message flickered:
\`SHIFT RELIEVED. THANK YOU.\`

The transformer hum subsided into complete silence. When Julian tested the power cord with his voltmeter, there were zero volts across the terminals. The line had been dead since the flood.`,
    setting: 'Decommissioned River Valley Substation',
    atmosphere: 'melancholic',
    character: 'Network Engineer Julian Drake',
    theme: 'A Lost Transmission from the Past',
    date: '1963-11-14',
    notes: 'A poignant tale of duty and closure preserved in the machine archive.',
    modelUsed: 'qwen2.5:3b (Offline Archive Sample)',
    tags: ['substation', 'crt-terminal', 'carrier-signal', 'demo'],
    wordCount: 382,
    isDemo: true,
  },
  {
    id: 'demo-sample-3',
    title: 'The Recursive Bell Tower',
    content: `At the center of Saint Jude Polytech stands the clock tower that students call "The Ouroboros." In 1899, professor of mechanical philosophy Thomas Vance installed a pendulum clock governed by a copper escapement of his own design—a mechanism intended to calculate the exact mechanical entropy of the universe.

When the tower was wired for the university's first UNIX network in 1982, the clock's brass gears were connected to an optical encoder to sync the campus mainframe clock.

It was during the midnight backup of October 1982 that the loop began.

Every evening at 23:59:59, the terminal in room 302 prints a single timestamp that does not exist in standard calendars: \`23:59:60.001 - PENDULUM HALTED AT INFLECTION POINT\`. Students who stayed in the laboratory overnight reported hearing footsteps circling the catwalk, followed by the smell of hot mineral oil and wet slate.

Tonight, Maeve sat alone before the green CRT terminal, watching the seconds tick down. When the clock struck midnight, the bells did not ring twelve times. They chimed once, then paused, then struck backwards. On screen, a terminal prompt appeared:
\`RUN_VANCE_CYCLE(n - 1) [Y/N]?\`

Maeve pressed 'Y'. A cold draft swept through the closed glass windows, blowing the notes from her desk. Through the glass, the hands of the clock tower outside began turning counter-clockwise, rewinding the moonlight across the courtyard stones.`,
    setting: 'Victorian Clock Tower & Campus Mainframe',
    atmosphere: 'suspenseful',
    character: 'Graduate Researcher Maeve Chen',
    theme: 'The Clockmaker’s Unfinished Equation',
    date: '1982-10-31',
    notes: 'An exploration of recursive time and gothic apparatus.',
    modelUsed: 'qwen2.5:3b (Offline Archive Sample)',
    tags: ['clockwork', 'recursion', 'unix-mainframe', 'demo'],
    wordCount: 264,
    isDemo: true,
  }
];

export const INSPIRATION_PROMPTS = [
  "The library card catalog contains drawer 00, filled with death dates of people who haven't died yet.",
  "An unplugged CRT monitor in an abandoned hospital reflects a nurse who isn't standing behind you.",
  "A shortwave radio receiver begins playing childhood lullabies tuned to 404 kHz.",
  "The university mainframe was powered down 30 years ago, but its hard drive still clicks in Morse code.",
  "An antique clockmaker's automaton starts reciting line numbers from an unwritten software codebase.",
  "A forgotten acoustic underwater hydrophone picks up a choir singing beneath the Arctic shelf ice."
];
