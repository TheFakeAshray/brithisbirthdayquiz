# Brithi’s Birthday Quiz

A birthday shopping-spree game. Brithi plays thirteen family questions and pockets a token for every one she gets right. Then she spins. The super token is $200.

A perfect game is **$350**: $150 from the rounds (including one $50 golden token) plus the $200 super token.

## Play it

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173`. The live quiz is at `https://thefakeashray.com/brithisbirthdayquiz/`.

The quiz is one play-through on each browser. A reload continues the same game. After the spin, that browser stays on the result.

`?preview=ending` opens the final wheel with every round already won, so you can rehearse the ending.

## The money

| Round | Question | Token | Answer in the game |
| --- | --- | --- | --- |
| 1 | How old is Brithi turning today? | $10 | 4,748 days |
| 2 | Who chased people with a knife? | $8 | Amogh |
| 3 | Uncles on mum’s side, start with A and have an S | $8 | 3 |
| 4 | How old is Mamu? | $5 | It’s a problem really |
| 5 | Where was Ashray born? | $10 | Mumbai |
| 6 | Who is this? | $8 | Sada |
| 7 | Where does Yashna stream? | $50 | Twitch |
| 8 | Where did we go on 5 May 2024? | $10 | Harry Potter: A Forbidden Forest Experience |
| 9 | Where was Adish born? | $8 | Auckland |
| 10 | How many apostles? | $5 | 12 |
| 11 | Great-granddad chicken fight | $10 | True |
| 12 | Number 1 song on 7 November 2013 | $10 | Royals, Lorde |
| 13 | Seashells | $8 | Shells |
| Spin | Super token | $200 | $200 |

Each question is one shot. A wrong tap spends the token and shows the answer the game is using. The wheel always stops on the **$200** super token.

## Make it more about her

Everything she reads lives in `js/game.js`.

- `STAR` is her name.
- Each item in `ROUNDS` is one round. Change `prompt`, `choices`, `pairs`, `prize`, or `label`.
- On a quiz, mark exactly one choice with `correct: true`.
- `SUPER_TOKEN` is the spin prize.

Where a question was marked with an answer, that choice is the one that pays, including “12” apostles and “Shells.” A few family facts were not marked. Those are called out at the top of `ROUNDS` with a confirm comment. Change `correct: true` if one of them is wrong.
