# Tq Engineering Sync - Mar, 20

# Transcript
**Nicolas Berrogorry | 00:24**
Hello? Hello? How are you?
I've been… good, I've been good.
Are we waiting for a request? .

**Reuben Brasher | 00:37**
Let's… let's get started, then. How did the… your experiments go?

**Nicolas Berrogorry | 00:42**
Well, I did have to balance it with some other stuff, but I got something that we can take a look at.
Let's see, so… basically, I did a couple of… Life quality changes.
basically added… I don't… yeah, I think you were on the meeting today, I can't remember, there were so many people,
But, basically now the circuits appear entirely, not cropped, you don't have to scroll them, and you can click them to view them.
And that will help.
And the other thing that I did regarding specifically this line of work is we had, like, this variant, the QMM error correction.
And this one, was the one that, basically…
how this issue where it produced, just basically pasted the 1Q8 sample on top of the other, of the…
Original circuit.
And what I'm trying to get it to do is to grab some of the learnings from what I experimented with the stochastic compression one.
Which, had this difference that, it was rules-based, so instead of just having some samples and asking it, hey, try to magically generalize from those samples and apply changes to a secret.
The stochastic compression tries to at least define a series of rules of how to modify a circuit, and based on that, apply variants using some randomness, like asking the model itself to be random out, how it applies it.
And also the… current QMM error correction, has, basically tags.
That we use, to determine, like, which types of error correction we want to apply, and I thought that, that's,
Basically, it's too much for a single agent at the same time, so what I did was try to work only with QMM RepSIM, and called it QMM RepSIMB2,
Now, this V2 has a… is the output of a similar conversation to what you suggested, like, continue,
try to leverage flow to produce a better… a better agent. And, what this, resulted in.
is the following, sort of, parameters. So…
it's more specific about how you want to apply QMM.
It's basically… I need to regenerate this, one second, please.
So, yeah, I suppose. Change this again, it's a little bit buggy.
Yeah, that's it. So,
Is there something going on in the background that is changing my…
parameters… can you give me one second, please?

**Reuben Brasher | 04:09**
Sure, go ahead.

**Nicolas Berrogorry | 04:11**
Oh my god… No, this is stopped.
Okay, this literally just changed on me, maybe I had something cached from the previous run, but the result, I'm just gonna run the pipeline.
And, basically, this is the idea, to provide the different…
to try to slowly understand what are the rules for applying QMM, to try to understand how we can select which qubits we want to better correct.
tried to preserve the original circuit information as well, because the example that I did in the middle that I was trying to find, and I couldn't, was basically completely destroying the original circuit.
And that… that made no sense. So I started asking,
hey, learn from the stochastic compression, which already has some protections against completely destroying the original circuit, add some contract. This will probably be very helpful, so let me open the…
instruction preset.
So, the instruction preset for V2…
QMMCMB2. This is a preset, and I added something that…
it named as IO contract, which… what is… what it means is, like, stuff that it shouldn't break from the original circuit when trying to apply QMM. And as I started, I basically told it to preserve,
the structure of the input parameters, the amount, the size, etc, to try to preserve the names of the input parameters, to go ahead and preserve the output parameters so it shouldn't change, like, the output itself of the secret, to try to imbue,
QMM inside, like, the circuit as intermediate stations between subcircuits, and all of that, and yeah, this for sure requires a lot of polishing, and we're not gonna get it done in one sitting today, or in…
probably quite a few seating, but, the output should already be ready, while it's optimizing the parameters, for us to take a look and compare how it's trying to apply QMM. So, this is a refresher of the original circuit.
It has 4 counting, bits… 4 counting qubits with edge gates. It has, the math that it needs to do to do the, for the quantum Fourier transform.
And it has the work qubits.
And basically, in the output, it measures, to the, output qubits.
To try to, determine, the phase to the phase estimation. And the…
variants here should have a QMM applied.
To that, and… it's not… I can see that it's… yeah, it has some cached values.
But… It's not yet respecting the inputs.
Maybe… Let me just ensure that it's not gushed.
So, good, viewer.
Okay, yeah, it's not yet respecting the input and output.
I still need to work on that.
But the structure…
is respected. Even though it did the freaking renaming of the parameters I asked it not to do,
The structure is preserved, and there is actual extra cubits applied to it.
And there are extra measurements I don't…
I'm not sure I see Crygates, but…
I think that it's, it's way better than we were standing before, and we can see that it's stochastically trying to apply QMM as well, so it's creating different variations of the circuits.
Here, it added more, it added more qubits, probably, for the… for the QMM parameters.
These are the Q event parameters. I,
3, and it's still trying to apply the angle from the… from the… from the sample, Yeah.
I would say that at least we are now meaningfully intervening the secret without destroying it, completely.
But it also still needs more… more work.
What are… what are your thoughts so far?

**Reuben Brasher | 09:17**
Gosh… It's a little bit hard to say what issues we're actually seeing, considering that
You seem to be having some… some trouble with the cash values.
Is there a way to restart this completely freshly?

**Nicolas Berrogorry | 09:37**
Yeah, this, this is, this has already restarted,

**Reuben Brasher | 09:40**
Okay.

**Nicolas Berrogorry | 09:41**
Completely, but we can build it from scratch. Let's build it from scratch, yeah. Let's start a new pipeline.
Let's put a circuit input, let's put in a…
variant producer, and select the QMM reps… Symmetry V2,
Let's add, the parameter optimizer that we're gonna need.
And let's add a result viewer.
Let's add a simulator.
Let's connect the input to the variant producer to this parameter optimizer.
To the simulator, to the result viewer.
Let's also add some secret viewers.
Before and after the parameter optimization.
And that should probably be it. Let me reduce this, so…
We don't care how precision, we need to run faster now.
And let's… Let's bring in the circuit from, from the samples.
This is the short algorithm again.
Paste it there. That's the instruction.
is the short algorithm.
onto XMO.
And… we now should be able to just… Apply.
Kick run. Let's run it.

**Reuben Brasher | 11:35**
So, that was the… the unmodified circuit?

**Nicolas Berrogorry | 11:39**
Yeah, this is the unmodified shore algorithm for…
Trying to find a phase estimation for 15.
with a CU of 7.

**Reuben Brasher | 11:51**
Right.

**Nicolas Berrogorry | 12:14**
What?
But, there you go.
Oh, yeah, it's deleting the…
The parameter names, so it wasn't a cache issue. It's still not respecting that instruction.

**Reuben Brasher | 12:31**
Huh.

**Nicolas Berrogorry | 12:34**
But the structure of the circuit.
Let me, for example, Let me just save this…
Maybe I can open it in another window. That's it.
Yeah, this may work.
And then we do this, and we do… this… Okay, so now… we can…
Go and take a look.
Diddy, friends.
Of the original circuit and the new circuit.
And we can see that the first part of the circuit didn't get…
changed too much. It changed the measurement, to, gate… And, it applied… mortgage…
This is 0 to 9, so this is 10, 1, 2, 3, 4, 5, 6, 7, 8…
Alright, so I added a couple more qubits here.
1, 2, 3, 4, 5… 6, 8… 1, 2, 3, 4…
It added 4 more quids, I think.
And… both in both parts, in both cell circuits.
No, it added 2 more… 2 or 3 more circuits because, those that share the same name, the same name are taking out the same qubit.
But it did make the…
measurement… the… basically the second half of the secret, where it performs a measurement for the phase estimation.
It did make it more complex.
So, I see… Very similar structure with these three measurements here.
It seems like it brought over the first measurement from the first half of the circuit down below, because it's measuring the same initial qubit.
So it does look like it's trying to apply QMM to some of the quads.
I know it's hard to tell, given that it renamed all of the parameters, but…
I think he's doing something more meaningful now.

**Reuben Brasher | 15:15**
Interesting. Well… Okay, so I did, unfortunately, miss the meeting this morning.
Okay. Had a conflict, but… Who else was there?
on.

**Nicolas Berrogorry | 15:30**
Yeah. Cheers.
I think…
said to… I remember it was the new guy on your side, I think it's Mariano, sorry if I'm murdering his name or misremembering.

**Reuben Brasher | 15:43**
Mario, Mario.

**Nicolas Berrogorry | 15:44**
Mario, Mario, yeah.
for sure, like, the… people from Solvio.
It was… Cedric was there. I can't remember if Lucas was… was there.
photographic memory, if I didn't see their faces on the cam.

**Reuben Brasher | 16:06**
Okay, okay. Well, that means that there probably wasn't anybody who was actually an expert at…

**Nicolas Berrogorry | 16:12**
Oh, yeah, to validate this, no.

**Reuben Brasher | 16:14**
the…

**Nicolas Berrogorry | 16:14**
Today's meet wasn't about validating this part, either.
It was more about, yeah, talking about the… the prior lookup, and the… and the graph, and the data from the… from the group, from… from Munich, toolkit.

**Reuben Brasher | 16:33**
Okay.

**Nicolas Berrogorry | 16:34**
Yeah.
Yeah, and the variants are different.
So it's doing various attempts.
This one is way more similar to original circuit.

**Reuben Brasher | 17:10**
Well, listen, so I think… I think we have to be a little bit more explicit about what we expect.
The QMM layers are going to be shallow circuits of this approximate structure.
And they will cover every qubit in the system.

**Nicolas Berrogorry | 17:27**
Yeah, sorry I turned off, I'm popping up my notes so I can…

**Reuben Brasher | 17:30**
It's okay, it's okay.

**Nicolas Berrogorry | 17:36**
So QMM will be shallow layers, you said?

**Reuben Brasher | 17:39**
Well, yeah, shallow… yeah, so the QMM layers are shallow circuits.
They have to be shallow, otherwise they're not…
Otherwise, the amount of time necessary to train them is going to be excessive.
So they have to be shallow layers… With…
you know, Cry Gates and the, good.
The, the conditional gates,
And they should cover every qubit in the system.
I don't see… Did… did you…
Give it instructions that would tell it to add qubits?

**Nicolas Berrogorry | 18:37**
Well, not specifically, but let me share my screen again, maybe?
So,
I didn't give it specifically instructions to add circuits, but in… my reasoning is that it's adding sequence because you need the extra qubits, it's adding, qubits because…
It needs, the extra for the parameters, basically the machine-learned parameters, the covily optimized ones.

**Reuben Brasher | 19:11**
Okay. Well… So, could you also output
The reasoning that it is applying to modify the circuits by these methods.

**Nicolas Berrogorry | 19:25**
So, basically, explain what it… what it did, like.

**Reuben Brasher | 19:32**
Wired. Yeah.
I can't see any other way to debug this.

**Nicolas Berrogorry | 19:40**
Okay, that's, that's interesting.
So… I do have some answers.
Or some points of view about that aspect of the system.
So… Basically, the LLM In my opinion, what it's doing is it's trying to,
Stochastically, like, randomly apply the set of rules that we give it, and whether the rules will produce stuff that makes sense depends on the amount of data that it has seen before, that it knows that it makes sense.
Making sense in this context, to me, is a very complex, Concept, basically. Because,
what it… because it depends on the taxonomy or the secret that you are evaluating. In this case, in the short algorithm, and… oh my god, I didn't show you, because you weren't on today's meet, so I didn't show you this. But,
Let me… Do one run without…
any parameter, like, without any error correction. Let me just create a circuit.
Paste the sample… OCs.
Based the sample, create the simulator directly.
And then the result viewer directly.
Okay.
Let me see if this will want to run…
Can't really see that it's locked in one.
Okay.
Mmm… what did you… What broke here? Let me reset.
Okay.
So,
These are the new graphs, because I did spend a lot of time thinking about how can we let the user determine if the secret that they inputted is providing the result that they want. And this is without any variant tradition, just running the original secret.
For these specific circuits, in order for the, the common divisor, to have the right, the right values, to find 3 and 5 as the,
primes, factors of, 15,
the signal that you're expecting is exactly this one. So you're expecting 000… Zero.
01001000 and 1100. If I didn't understand this incorrectly, if you get this, basically what it means
Is that, you can bring this… extract the…
Let me see if I'm hiding here… One second place… I have my notes here.
Yep.
So,
basically what it means is, that using the algorithm to… from the phase estimation, using the QFT,
We, do the magic formula to extract,
Based on the output bits, basically.
What are the, common,
the resource of this… of this magic formula 15, and we get, 5 and 3, which is the correct output. And that will determine that the actual short circuit is running. So…
to me, even though we cannot, and I will definitely do that, since you asked,
we can ask the LLM to explain what it did, but to me, it's probably more relevant to just, at least at first, generate a bunch of random variants to try to polish those rules, and basically, we are not relying on the LLM
To reason, but rather to reason about our rules that we specify into a variant producers.
So that, basically, We can trust, that it's applying
This is not the pipeline that I wanted to look at.
But… so basically that we can trust, that it's applying the permutations of the secrets in a way that… that we want, and…
If any result will either, converge far… faster, or all of the different,
possibilities, of, basically analysis on the statistics, on the output. If the produced circuits converge to the same values in the case of the short algorithm.
it means that it's still working, and I don't know if the short algorithm is the best algorithm to
Try this on.
But yeah, we should probably guide ourselves to, for example, is it still producing the right values.
in the output.
that's… that's, I think, my… my chain of thought of this week, is… is that, like, we produce a bunch of variations, we ensure that these variations
are done from rules that we specify. We try to learn about,
those rules that we specified and try to polish those rules for stochastic compression and for QMM or any other strategy or type of permutation that we want to do to cirquist, run a batch of them, compare them, and basically
But… but by knowing about the circuit,
that we are running, for example, in this case, we're running short, and we know that it needs these peaks, on these bit strings.
Mmm… We can… we can evaluate if the variants are correct.
So we can definitely add the explanatory stage.
What I think that will help us with is try to understand if our rules are correct.
Or not.

**Reuben Brasher | 27:04**
Yes, that's my hope.

**Nicolas Berrogorry | 27:06**


**Nicolas Berrogorry | 27:43**
Yeah, I missed researching more about that point with all of the other stuff, but you're right, I'm gonna dig into that for next week.

**Reuben Brasher | 27:51**
Yeah, because I have no idea what it's trying to minimize for this particular problem.
It's not just a single qubit output which matters in this case.

**Nicolas Berrogorry | 28:02**
Yeah.
So… Covila, what I think it's doing is,
It's trying to traverse, variations, like, it's trying to modify the parameters.
to optimize, towards a goal, and I think the goal that was specified, and this is purely by year, because I'm still, like, total new on this, but, I think the goal that it was trying to do on the original circuit, it was try to bring all of the qubits to zero.
I think that was the goal. It may still be trying to do that.

**Reuben Brasher | 28:45**
-Oh.

**Nicolas Berrogorry | 28:46**
Yeah, and if it's doing that, that would explain why
On the result, like, the QMM now, at the moment, is producing, zero.
For all the wheat strings. But I'm not sure. That's my theory.
from a… from engineer with researchy vibe. Yeah.

**Reuben Brasher | 29:09**
Yeah, I got it, got it, got it, got it.
Well, okay, I think we'll have to follow up again next week.
I have to go to my next meeting as it happens.

**Nicolas Berrogorry | 29:21**
Okay.
Okay, I will try to look into it, and try to validate that, and apply the reasoning output that you asked for.

**Reuben Brasher | 29:30**
Okay, thank you.

**Nicolas Berrogorry | 29:31**
Okay.

**Reuben Brasher | 29:32**
See you later, Nick. You take it.

**Nicolas Berrogorry | 29:33**
Have a good one. Yeah, thank you.
But…
