# Brithi’s Birthday Bonanza

A birthday shopping-spree game. Brithi plays thirteen rounds — funny questions and short minigames — and pockets a token for every win. Then she spins. The super token is $300.

A perfect game is **$500**: $200 from the rounds (including one $50 golden token) plus the $300 super token.

## Play it

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

The tab remembers a game in progress. Closing the tab starts fresh. Refreshing mid-round replays that round; finished rounds stay pocketed.

`?preview=ending` opens the final wheel with every round already won, so you can rehearse the ending.

## The money

| Round | What she plays | Token |
| --- | --- | --- |
| 1 | Main character | $15 |
| 2 | Birthday breakfast | $12 |
| 3 | Pop 8 balloons | $10 |
| 4 | Shop doors | $8 |
| 5 | Cake science | $15 |
| 6 | Memory match | $12 |
| 7 | Golden rule | $50 |
| 8 | The perfect thing | $15 |
| 9 | Catch 7 gifts | $10 |
| 10 | Family duty | $8 |
| 11 | This or that | $15 |
| 12 | Present timing | $15 |
| 13 | Name on the ticket | $15 |
| Spin | Super token | $300 |

Questions give one retry. Minigames can be tried again until she lands them, except This or That, which gets one clean run. The wheel is part of the gift: it always stops on the **$300** super token. The other numbers are there for the drama.

## Make it more about her

Everything she reads lives in `js/game.js`.

- `STAR` is her name.
- Each item in `ROUNDS` is one round. Change `prompt`, `choices`, `pairs`, `prize`, or `label`.
- On a quiz, mark exactly one choice with `correct: true`.
- `SUPER_TOKEN` is the spin prize.

Swap in real family jokes whenever you have them. The defaults are written so the game is funny and winnable without inventing facts about her.
