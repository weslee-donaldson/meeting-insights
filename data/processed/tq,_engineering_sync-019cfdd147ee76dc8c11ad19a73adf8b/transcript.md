# TQ, Engineering Sync - Mar, 17

# Transcript
**Wesley Donaldson | 00:03**
Good afternoon.

**Reuben | 00:07**
Hey, Wesley, could you give me just two minutes?

**Wesley Donaldson | 00:08**
Could you give me just two minutes?

**Reuben | 00:10**
I'll be right with you.

**Wesley Donaldson | 00:11**
Take five. Nicola's not here anyway, so five... No, just two. I'll be right back, okay?

**Reuben | 00:13**
No, just two. I'll be right back. Eight.

**Speaker 3 | 01:02**
Hello?

**Wesley Donaldson | 01:05**
Hey, give Rub a couple of minutes.

**Speaker 3 | 01:09**
Yeah, I'm sorry I'm a minute late.

**Wesley Donaldson | 01:11**
Sorry I'm a minute late. You're okay.

**Speaker 3 | 01:15**
I was anxiously waiting for the time to come, and I grabbed the phone, looked up, and I was a minute late.

**Wesley Donaldson | 01:15**
I was anxiously waiting for the time to come and grabbed the phone, looked up, and I was...

**Speaker 3 | 01:23**
[Laughter].

**Wesley Donaldson | 01:24**
[Laughter] But what is the standard?
If you're if it's your meeting, you should not be a minute late. If it's a meeting that you're attending and it's not a client meeting, you can be up to like five minutes late. And you know, about five minutes is about the standard like anything over that then you're really late.

**Speaker 3 | 01:42**
Okay.

**Wesley Donaldson | 01:42**
Okay, I hadn't thought about it that way, but I will take that into consideration in the future.

**Reuben | 01:44**
I hadn't thought about it that way, but I will take that into consideration in the future.

**Wesley Donaldson | 01:50**
It's probably just in my head. Silly rules that you give yourself. Right. I don't know.

**Reuben | 01:57**
I don' anyway, what's up?

**Wesley Donaldson | 01:59**
Anyway, what's up? How are you?

**Reuben | 02:01**
How are you? I'm doing well.

**Wesley Donaldson | 02:02**
I thank you for making this time room and I really appreciate it.
Like, I just wanted to like, as I said, like the goal of these is just to get in front of you. You specifically, you and Florrid specifically, just to give you guys a chance to kind of really help steer this a little bit. Jeff has made some conversation about some additional team members that might be joining to help lean in and provide us some like, you know, quantum science guidance in lieu of that.

**Reuben | 02:27**
Yes.

**Wesley Donaldson | 02:27**
Or honestly, it's up to you if you want to be continued to be part of that conversation or if the intention is to have one of those gentlemen lead these. Either way, just wanted to share what we have, see how we move in your direction from last time forward, and give you a little bit of a preview of what we're thinking for the next timemo.

**Reuben | 02:44**
My goodness, I don't know if we've put enough thought into it to assign leadership to this, but let's... Let me see what I can do for you.

**Wesley Donaldson | 02:46**
Enough thought into it to assign leadership to this, but let's... Let me do it.
It's free form, so, Nicholas, I'll hand it to you, consider me an annoying fly on the wall.

**Speaker 3 | 03:02**
[Laughter] Okay, let me share my screen then, and I can then proceed to begin a conversation.

**Wesley Donaldson | 03:03**
Okay. Let me share my screen then. I can then proceed to begin a conversation.

**Speaker 3 | 03:15**
I need to share the screen.

**Wesley Donaldson | 03:15**
And I need to share the screen.

**Speaker 3 | 03:17**
Let me move this to the other screen.

**Wesley Donaldson | 03:17**
Let me move this to the CL screen hoops.

**Speaker 3 | 03:23**
OOPs. Alrighty, so where are we at?

**Wesley Donaldson | 03:27**
Alright, so where are we at? The last conversation that we had was about the fact that we wanted to be able to provide me with an open terminal.

**Speaker 3 | 03:32**
The last conversation that we had was about the fact that we wanted to be able to provide... Let me open a terminal and launch the project again. We wanted to be able to provide a way to evaluate the sequences that we produce.

**Wesley Donaldson | 03:47**
We wanted to be able to provide a way to work.

**Speaker 3 | 03:52**
That resulted in a huge rabbit hole where we learned that there's a huge taxonomy of circuits. Within each category, basically, we need different ways to evaluate the secrets. What that means is that what originally started as "Let me open here," originally started as a simple expected output value for a single Q. It turned out that for any meaningful real sequence, we can't have a specific expected output.
We went over the different types of circuits. This is in taxonomy that MD and basically the... We went over the different taxes that I found that we can use to categorize the quantum circuits. Across all of those factors, we found that there are a bunch of different types of SDS, and we said, "Okay, let's go for those that are easily classically verifiable first."
From those in that subset, let's try to do a Shor's factoring, for example. So, well, know that I'm not a quantum expert, but I did my best to understand how Shor's algorithm is done. Basically, I did a toy sample specifically for the number seven.
So, the Shor's algorithm for factoring seven adds just enough bits to try to work out the inverse quantum Fourier transform to find... I think it's the curiosity of the function. I think we lost. Roven no.
Okay. It was just your camera. No, and yeah, to find the periodicity of the function that is used then with another co prime math to figure out like the actual factors of the number 15 that I was able to sort of understand.
I know that creating a general or supporting a general short algorithm is way harder. Like because you have to dynamically determine how many cubits you need for your. I guess your the order of magnitude of your number.
And they found, some revealing stuff that I really need your input or that we as a team really need your input, which is the following. It seems like quantum computers are, sort of like limited to it to ED at about like a thousand cubits for doing e meaningful work, for example.
And that, for example, the short algorithm. In order to actuallyve that it's. That it produces quantum mavansh. We need a very. To do it with a very large number, which is what would be very hard to do for a classical computer and for such numbers. There is no quantum computer today that could like, run such a large, circuitt for any like, uhh, real short quantum advantage on practice today.
So how do we deal how do we look at that as a team? Like for now, do we continue onward, do we implement it as far as we can simate it? How do we feel that? Like?

**Reuben | 07:50**
Well, okay, so this is what I would do if I were you. I would punt on this. I would definitely have some example problems, but you're going to have to rely on whoever uses this to provide a method for constructing the circuit corresponding to the problem and a method for evaluating the quality of the results.
Okay. Because you can't possibly have a completely general... I mean, you could, but you'd spend the next year working on it. I don't think that that's the point of it. I think the point is that we need to demonstrate some value for this QMM application, which is designed to improve particular known circuits.
So yes, assume that you know the circuit and assume that you have a method for judging the quality of the results, but treat those as black boxes. Definitely do what you are doing and provide some demonstrations with well-known problems.
But you are going to end up trying to boil in the ocean.

**Speaker 3 | 09:08**
Got you. Yeah, that's how I was feeling about all the tax, the whole taxonomy of things. If we wanted to provide ourselves a way to... So do you think it's fair to even look into adding a way for people to do their own validation?
Because for now, what I know that we can output is, for example, "Hey, we can show you the results of the sequence in the most meaningful way possible. How can we help someone work their way to connect these results to their experiment?" Or, for example, "Should they copy-paste the output and paste it on a send output like...?"
Well...

**Reuben | 09:49**
No. You should not try to do this in full generality. You should find some characteristic problems, some famous problems which you have identified. Shor's, Grover's, and QAOA, and then you should...
Sorry, I have to sneeze. I apologize. The spring is here, so to speak. Yeah, like I was saying, don't try to do this in full generality. That's way out of scope. I think it so clarifies that I mean and document what it is that you're doing and then document your demonstrations. I assume that you will get a chance to show these to other people besides me at some point.

**Wesley Donaldson | 10:51**
[Laughter].

**Reuben | 10:54**
Otherwise, this is... I appreciate this, but I'm only one person, so we're going to have to show this to other stakeholders at some point, and I think that it's up to Jeff, Florrie, and... To decide how to do that.

**Speaker 3 | 11:08**
Yeah, okay, so the cause...

**Reuben | 11:14**
Wait. Let me ask you. I mean, are you. I want to because you've feel that you have already satisfied the task that you have been given. Because kind of like maybe you have.

**Speaker 3 | 11:28**
That I have to satisfy...

**Reuben | 11:29**
The test you have given. So I think that you may not feel comfortable with a completely open-ended task because it could be anything. So what we have asked you to do is demonstrate the QMM in this system.
But the QMM applied to what?

**Wesley Donaldson | 11:52**
Exactly so ho on.

**Reuben | 11:53**
Exactly. Yeah.

**Wesley Donaldson | 11:55**
Let me jump in if I could. So FL, you hit it right on the head. We've been... I don't want to say spinning our wheels, but we've gone down paths that are complimentary. One, for example, it's identifying the specific types of circuits that we could...

**Reuben | 12:04**
M yes.

**Wesley Donaldson | 12:08**
Nicholas found a really good source for a wide variety of possible circuits. So that's one track. The other track we've been going down is great. We have circuits, categorizing the circuits, and understanding the nature of the circuits to determine what is the right point to be injecting QM. That's another track of work that we're going down, right?
That's where I think this conversation... Your guidance is super helpful. We have a list of circuits we're exploring the categorization is your purview here or your direction that... Don't try to figure out a generalized solution for categorizing circuits. Make the assumption you have a known quantity and how and what that function is that actually says it's successful or not, and use that because at least then you have a known set of where to inject.

**Reuben | 12:43**
Yeah.

**Wesley Donaldson | 12:52**
Q Perfect.

**Reuben | 12:53**
That's right.

**Wesley Donaldson | 12:57**
So, Nicholas, maybe it's worth just... If Shore is the right example for us to use, great. Maybe it's worth just showing him kind of what you shared with me yesterday about this, the possible open source options you found, and maybe let's just pull out two out of that.
That's like.

**Reuben | 13:13**
Wait, there's one thing that I want to point out. There you want to have some examples, which are like Schorr's algorithm and Grover's algorithm, which depend entirely on the data and they are... They don't have any variational components, but QAOA itself is a variational quantum circuit.
So you will handle that differently. But I honestly, I would suggest that you consider the simplest problems first. That is the VQ, the variational quantum circuit, which is just trying to create a binary classifier.

**Wesley Donaldson | 13:56**
What will happen that whole day?

**Reuben | 14:03**
So if you have three examples, I guess four examples. I mean, you do have the rep 3 circuit from the Jupiter notebook. You have a variational quantum circuit, and you have a simple example of Schor's algorithm.
Factoring three times seven, 21, or three times five, or five times seven, are sufficiently challenging. You just need to demonstrate this. Then an application of Grover's algorithm.

**Speaker 3 | 14:43**
Okay, I can definitely add that to the demo and look for a way of validating those results specifically. What I don't understand yet is... Because... Here we should really go into your pressing your most pressing point, which was being tasked with applying quantum memory matrix to the Sequs.
So should I try to apply or see how the system does rather applying QAOA to these samples?

**Reuben | 15:30**
Yes, you should do that.

**Wesley Donaldson | 15:32**
Well, is the real question here, Nicholas, should we do we need to walk the classification path first?

**Speaker 3 | 15:33**
But...

**Wesley Donaldson | 15:39**
By the virtue of using known circuits, we effectively know what the layers are within that circuit, and we could determine when. Again, forgive me if I misspeak here. Where we can actually apply QMM, like, don't we still need to...?

**Speaker 3 | 15:52**
If we're... My opinion is that if we are going to constrain this to these very specific, more simple examples, we can post the work regarding classification, not with respect to the QMM prior, because that's a whole other line of work from Chef's requirements.

**Wesley Donaldson | 16:04**
Okay.

**Speaker 3 | 16:14**
But specifically, when we're talking about a QMM, I can definitely run the pipeline through QMM and see what the results are and do a very specific result evaluator for the Schor algorithm that will validate if it did the factorization correctly by doing the common, prime, and co-prime. That you mass that you need to output to actually verify if it's correct. I can do that. What I cannot do by myself is to know that it's applying QMM correctly.
So the...

**Reuben | 17:02**
I think you're overdoing it.

**Speaker 3 | 17:05**
Okay.

**Reuben | 17:05**
So you don't... What you're going to get out of this is you will have a circuit diagram, and at some point, some of the parts of it are going to correspond to the QMM. So I think that you should rely on the judgment of the other scientists.
Yeah, to see whether or not it has constructed the QMM layer correctly, because he does that. It was kind of opinion. I mean, there are so many ways that you could do this. I think that may be one of the problems.
You have a lot of latitude in how you could construct this, but if we're following the examples from the paper, they're very simple layers, they're specifically designed to be simple. So the validation for whether that is correct starts out with just having an expert inspect the results he now...
So ideally, we would be able to. Okay, how are you splitting the noisy circuits?

**Speaker 3 | 18:31**
The noisy circuits are done exactly per specification. We are doing a suite using the internal mechanism for providing noise that kids utilize. Okay.

**Reuben | 18:44**
Okay then that's it. That's really all that you have to do. So you make sure that the QMM layers that are applied are sensible. They're going to be relatively shallow circuits, and this could be determined by inspection like... I don't know.
I mean, ideally, Florian will show up and actually take a look at these because I have my opinions, but... Hey, that looks fine. What you're showing me right there. So that's the QMM layer, right?

**Speaker 3 | 19:23**
Yeah, but for the simple single QMM circuit, I haven't run this, because I was making some changes, but let's run it to see what it does.

**Reuben | 19:33**
Well, anyway, so you're going to do this, and then you're going to see what the results are without the QMM layers. You're going to add the QMM layers, train them, and then you will see whether or not it is improved. The results are straightforward, and I don't really think that you are failing to understand this process.
I think you got a pick.

**Speaker 3 | 20:07**
Okay, that's good to know. I guess, yeah, the well, yeah question then, remains on my side. Basically, of course, we're going to share this with everyone and get feedback from everyone, but, mostly to see, I guess, what next steps could be like, what improvements could look like.
For example, I don't have a clue what the QMM did to this short algorithm, but whenever it's converting faster with a QMM than with... So it's conversion to 00:22. I have to see what this graph means because this circuit, in contrast with the others, has more than one output.

**Reuben | 21:03**
Yes.

**Speaker 3 | 21:03**
So this one will be interesting to see how we plot thism but that's yeah that's how where we take it that that's where we should take it from like what is he doing how do we improve this what's the goal or next goal.

**Reuben | 21:22**
Well, okay.
Yeah, sure as algorithm.

**Speaker 3 | 21:43**
Try to see what it did, like how it applied to. So here is the baseline, and it has four counting cubits and a couple of work cubits. It does the quantum Fourier transform with the GE gates. Sorry, I assumed we were going to have to work on this UI a little bit.
So this is what the original looks like, and we go to the rep scene. What is it doing? Is it adding anything? I will need to see them side by side or download the QSM. Yeah. So it added the cubits for the parameters of the QSM.
But where they added those, it added those sort of in parallel. I'm not sure that it was able to integrate into anything like... I'm not sure, for example, that the agent... Remember the last time that we upgraded it and imbued it with knowledge from the paper?
For example, I'm looking at this, and for sure, I'm not seeing that integrated into the existing shore Anthropic sample. It's sort of like a run-of-the-mill QSM in parallel.

**Reuben | 23:15**
In that case, it's doing nothing. So yeah, there has to be an interaction between the cubits.

**Speaker 3 | 23:20**
Otherwise, I understand. I don't know what interaction, but I know that I can distinguish that there has to be an interaction.

**Reuben | 23:29**
Yeah, we can look at this. Hold on, it does look like there is no interaction. You would see that there was some connection at some point.

**Speaker 3 | 23:37**
I'm trying to download this to open it on a...

**Reuben | 23:40**
Hold on, you can just scroll through it. I mean, yeah, you do have to improve this UI. My goodness, no.

**Speaker 3 | 23:52**
Yeah, it's nested scroll.

**Reuben | 23:57**
Nested scroll. Well, you did it to yourself, that's what happened. Yeah.

**Speaker 3 | 24:06**
So, yeah.

**Reuben | 24:08**
Okay, we can't tell what it's doing, but it doesn't look like there's any interaction between the QSM layer. It looks like it just added cubits and then created no relationship between them. In which case... Yeah, in which case there's no question there will be no effect whatsoever.

**Speaker 3 | 24:27**
Yeah, so... But I guess we can take a few things to improve here. For example, we need a better UI to inspect the circuits. We need to try to improve the variant producer to at least get it to intervene in the secret and not a QM and parallel.

**Wesley Donaldson | 24:53**
How does it know where to add it?

**Reuben | 24:54**
Yeah.

**Wesley Donaldson | 24:54**
Do I mean that was the point of the categorization work? So isn't that something that we need to figure out? Rinor.

**Reuben | 25:01**
Well, so the thing is, it's not clear to me that if you have human intelligence, just take a quantum expert from the street and tell them to do this, that they will be able to do it without error.
Because this is novel research in the sense...

**Wesley Donaldson | 25:26**
Is that the answer then?

**Reuben | 25:26**
Let me think.

**Wesley Donaldson | 25:27**
Is it more about a random... The shotgun struck... You're just trying it at x number of times seeing what they're seeing that the impact and the result... The result is...
Then whichever one has the more favorable result, as determined by the user, that is the correct quote unquote place to apply it.

**Reuben | 25:45**
No. Or wait a minute, are you talking about the stochastic impression? I'm... I'm not even thinking about stochastic compression right now.

**Wesley Donaldson | 25:50**
No, like the question of where we... How do we determine when, how many, and where to apply...

**Reuben | 26:01**
Well, so it is pretty clear to me that somehow the system has not understood at all what to do with this particular circuit.

**Speaker 3 | 26:11**
So how would the first time we run... Yeah, a complex large circle within.

**Reuben | 26:17**
So we would have to give it some kind of refinement. I mean, obvious. So what I think is these QMM layers at so you insert them somewhere into the circuit. To be honest, I don't think any of us knows where the best place is.
That's novel research. That's something which has never been determined yet, but the prompt probably should make it clear that you have to apply them to all of the cubits of the actual circuit rather than have them in parallel.
Yeah, I mean, maybe just adding that simple sentence would...

**Speaker 3 | 26:58**
I agree. To get more creative, to try more stochastically, try to intervene with a secret. That's doable. So do we want to try this now?

**Reuben | 27:23**
Not well, actually, I do have to go pretty soon, but we could... I just don't know exactly how we would modify the prompt. I suggest you just play with it. Yeah, and not only that. Look, do have a conversation in a chat like the... What I did where...
Okay, you take it, and ask it to explain to you the concept. So ask it to explain why it put these so... Take this same prompt. I mean the same thing that you have done here in this system, but do it in a chat and then ask interrogator say why did you do this? Why did you put these in parallel?
It will probably give you some guidance about how it misunderstood.

**Speaker 3 | 28:33**
Okay. Yeah.

**Wesley Donaldson | 28:43**
What does this time is this time generally?

**Reuben | 28:43**
But yes, we should probably meet again. I don't know when, though. Okay.

**Wesley Donaldson | 28:52**
Or maybe not today, but... Does this time generally work for you?

**Reuben | 28:57**
It's well, the... Okay, so because I work for a European company, I start work at seven o'clock, so this is usually when I have put my tools down, so to speak. Tomorrow I'm going to be out Thursday. What does Thursday look like?
Maybe... At this time, okay, wait, yes, I can do Thursday this time.

**Wesley Donaldson | 29:17**
At this time? Okay.

**Reuben | 29:23**
Yes, I can do that.

**Wesley Donaldson | 29:26**
Happy to set it up. Or if you want, Rinor, if you want to own it so we can move it around if you need to... Happy to take it.

**Reuben | 29:31**
No, go ahead, send an invite, I'll catch it.

**Wesley Donaldson | 29:37**
Sounds good.
Maybe, Nicholas, one last question just to give Rinor his time. Do you think you have enough clarity for the next couple of steps you can take and what your targets are for Thursday?

**Speaker 3 | 29:51**
Yeah. I think that I'm going to prioritize getting something more tangible, more meaningful with the variant producer and doing a U IPAS, to ensure that we can actually see what we're working with. Does it sound good?

**Reuben | 30:13**
Yeah, that does sound good. Like I say, have the conversation in a chat. Ask it why it has made these decisions because what it's doing is clearly wrong. Yeah, I mean, it's clear to you and me that it's wrong.
Yeah. But it's not clear why. It's not clear to the LLM why this is wrong. Okay, so first of all, ask why it put... That's a good question. If you put this in... Another just do the same thing, but in a chat, is it going to do the same thing where it will attempt to put the QM in parallel and then ask it why it did that?
Then ask it how it thinks that it is supposed to evaluate the quality of this particular use case. Okay.

**Speaker 3 | 31:12**
Because I that one maybe I already did.

**Reuben | 31:16**
Well, so. So the thing is, you have these QM layers and then you're basically training them by Gradient Descent but that requires that you have a cost function. What cost function are you using in this case?

**Speaker 3 | 31:35**
That's an amazing question. I am using the exact same optimizer that we are using for everything and is doing its own Gradient Descent. I think it's doing it to minimize error
but what does that even mean?

**Reuben | 31:50**
Like I have to.

**Speaker 3 | 31:53**
I can give you the code about it later.

**Reuben | 31:56**
Later? Yeah. Actually, let us inspect that later Thursday. Let's circle back on Thursday and I'll tell you, I got to admit to you quite frankly that what you're doing is novel research.
So you can't really expect even a quantum expert to have all of the answers for you. For example, these other people who are going to come and meet you, well, they've never worked with QM. They may have less idea about it than you imagine.
I know about this because I worked really closely with Floridian, and I read the paper that he wrote.

**Wesley Donaldson | 32:37**
That's a good expectation management for us.

**Reuben | 32:38**
Okay, good.

**Wesley Donaldson | 32:39**
I appreciate that.

**Reuben | 32:41**
Yeah.

**Speaker 3 | 32:42**
Good, because we want to make this we want to make this correct and make you asys happy. And that's the if you feel any pressure anytime on our side, it's more because we want to serve, right?

**Reuben | 32:56**
Yes, I get it.

**Wesley Donaldson | 32:57**
Okay, I think we have... So let's give everyone some time back and we have a couple of clear tasks and I'll get a meeting on the calendar for us to revisit on Thursday.
So that's a good couple of days, working days for us to get back and make some progress and have a next one, right?

**Reuben | 33:14**
Okay, I'll talk to you guys later then.

**Wesley Donaldson | 33:16**
Enjoy the evening. Thanks, both.

**Speaker 3 | 33:18**
Thank you so much. Bye.

