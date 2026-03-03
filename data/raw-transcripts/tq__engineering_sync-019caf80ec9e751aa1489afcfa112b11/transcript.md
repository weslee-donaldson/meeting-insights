# TQ: Engineering Sync - Mar, 02

# Transcript
**Nicolas Berrogorry | 00:01**
I think, this is a situation, on IO currently.

**Wesley Donaldson | 00:01**
I think, this is a situation on IO currently.

**Nicolas Berrogorry | 00:08**
So we have worked mainly to try to produce a set of backend workers and events that can be viewed through a pipeline, that can achieve more than what's the notebook about QM M that we were originally given thus.

**Wesley Donaldson | 00:08**
So we have worked mainly to try to produce a set of bargain workers and events that can be viewed through a pipeline that can achieve more than. What's the notebook about? Q that we were actually hearing. Th and that, of course, is not easy.

**Nicolas Berrogorry | 00:35**
And that, of course, is not easy feat, but the state where we are right now is that I can ingest a QSMA pre normalized QSM sir, quick QS m three cr d it can detect its parameters.

**Wesley Donaldson | 00:38**
Ft but the state where we are right now is that I can enchest a QSMA prenormalized Q sl cirqu qsm3 d irwack it can detect its parameters.

**Nicolas Berrogorry | 00:54**
It can feed it to a variant producer that has some BI code like first version, first draft instructions from engineering to apply QM M and other types of error correction that appeared in the notebook, for example one or more layer QMM only reb 3 only Qm plus reb 3 symmetry.

**Wesley Donaldson | 00:54**
It can feed it to a variant producer that has some BI code like first version of first draft and instructions from the engineering to apply QM and other types of error correction that appear in the notebook, for example one or more layer QM only prept only QM MS pres symmetry.

**Nicolas Berrogorry | 01:19**
I think it's called the combo of those two.

**Wesley Donaldson | 01:19**
I think it's called the combo model to Balbarian producer gras original secret stri to apply if one of decides and then send it.

**Nicolas Berrogorry | 01:23**
That variant producer grabs your original secret, tries to apply each one of these types and then send it. And since some of these types introduce parameters, it tags each of the new parameters as QM M parameters and then those.

**Wesley Donaldson | 01:32**
And since all of these have introduced parameters, it's tags each of the new parameters as QM parameters. 
And then those each one of these sequences with the new parameters and that are tacked are sent to a parameterizer node.

**Nicolas Berrogorry | 01:43**
Each one of these sequences with their new parameters and that are tagged are sent to a parameter optimizer node, and that parameter of optimizer node runs cobilla dynamically for each one of those parameters.

**Wesley Donaldson | 01:50**
And that parameter oftimizer node runs cobilla dynamically for each one of those parameters.

**Nicolas Berrogorry | 01:56**
For each that are tagged as QMM.

**Wesley Donaldson | 01:56**
For each. We are as QM for each circuit that goes through the simulator into the result viewer and at every stage of the way, you can check a set viewer to see what the parameters were like what the result of the occupation was.

**Nicolas Berrogorry | 01:58**
For each circuit that goes through the simulator into the result viewer and at every stage of the way, you can inject a squit viewer to see what the parameters were like what the result of the optimization was not of that.

**Wesley Donaldson | 02:13**
None of that.

**Nicolas Berrogorry | 02:14**
And the result viewer plugs everything and shows a first draft of a conversion graph that sort of tries to show if it aligns or not with an expected value, but it shows the same Losi color versus noise sleep priority graph that appears on the notebook on the IAN notebook.

**Wesley Donaldson | 02:14**
And the result viewer builds everything and shows first draft of a conversion draft that sort of tries to show its or not with unexpected value, but it shows the same no versus no sweep priority graph that appears on the notebook on the original notebook.

**Nicolas Berrogorry | 02:36**
So that's our current state.

**Wesley Donaldson | 02:36**
So that's our current state.

**Nicolas Berrogorry | 02:38**
And now back to your question which circuits have?

**Wesley Donaldson | 02:38**
And now back to your question which series have we run this on?

**Nicolas Berrogorry | 02:41**
We run this and we run it with the one quit from the notebook.

**Wesley Donaldson | 02:41**
We run it with the one cubit from the notebook, and I recently added a random ST generator.

**Nicolas Berrogorry | 02:45**
And I recently added a random Squid generator node that was asked and that can produce one or more variants for the random to generate random circuits with different set settings for example, different depth and all of that.

**Wesley Donaldson | 02:48**
Or no, that was sold to us and that can produce one or more variants for the random to generate random circuits with different settings for example, different deck and all of that.

**Nicolas Berrogorry | 03:00**
But we have not yet run it with, for example, QAA or other types of circuits.

**Wesley Donaldson | 03:00**
But we have not yet run it with, for example QAA or other types of cirs.

**Nicolas Berrogorry | 03:08**
I am just starting to learn about the taxonomy of different circuits and how some of them require different strategies to measuring if they are behaving correctly or not.

**Wesley Donaldson | 03:08**
I am just starting to learn about the taxonomy of different circuits and how some of them require different strategies to measuring if they are behaaring correctly or not.

**Nicolas Berrogorry | 03:21**
Some of them can have, like, an expected value, but some of them need to, like, keep within certain ranges.

**Wesley Donaldson | 03:21**
Some of them can tell they can expected value, but some of them need to like keep within certain ranges.

**Nicolas Berrogorry | 03:30**
And they're like, it's more way more ones than what we have.

**Wesley Donaldson | 03:30**
And it is more way more than what we have. I TED applying like creating a random, diverse random squid and passing it through QM by a producer.

**Nicolas Berrogorry | 03:35**
I tried applying like, creating a random depers random circuit and passing it through QMM variant producer, and it's did its best to apply like the exact same QMM like, the three G center of that to that circuit.

**Wesley Donaldson | 03:45**
And it's this best to apply like the exact same QMM like, three gigs and that to that circuit.

**Nicolas Berrogorry | 03:54**
It wasn't really smart about it.

**Wesley Donaldson | 03:54**
It wasn't really smart about it.

**Nicolas Berrogorry | 03:56**
So maybe that's where we can begin the conversation.

**Wesley Donaldson | 03:56**
So maybe that's where we can begin the. Yeah, sorry said one quick point and I love that phrasing is that you guys are going to work through I think Ruben full transparency. We're trying to figure out where the line of this is a real product. We do not think this is a real product yet. 
So we're trying to find where the line is of demonstrating just enough to make this make sense. Be valuable get alignment and then if it if truly if it becomes a real product there's more much deeper work to be done. 
So if I could ask. Help us find where that line is. To what? Nicholas just said. Like, there's a shit ton stuff that we need to make that fit properly within the way quantum mechanics work. And like, I don't think it's realistic to expect us to solve those 500 items. 
Maybe not 500 those 50 items to get this to be to get this the direction of this turn this into something a little bit bigger because if once we get that direction then there could be a conversation with the size team. Is it a combination of TQ and Solvio? Is it all TQ like let that decision come down? Line would just help us with what you need for to help walk up to that line of let's have the decision. Let's give you enough to make the decision that makes sense.

**Reuben | 05:18**
Yeah, it does. I okay, so relax.

**Wesley Donaldson | 05:20**
I okay, so relax. 
I think what is important here is that we have some infrastructure and we need to verify that it doesn't necessarily matter that the engineering keyboard that I is capable of using this.

**Reuben | 05:28**
I think what is important here is that we have some infrastructure and we need to verify that it doesn't necessarily matter that the product engineering team or that I is capable of using this. What ultimately was probably going to be significant is if we can give some value to the applied research teams.

**Wesley Donaldson | 05:49**
What ultimately was probably going to be significant is if we can give some value to the applied research teams.

**Reuben | 06:04**
So this is a particular research project.

**Wesley Donaldson | 06:04**
So this is a particular research project and happens to be convenient to us because it was done directly by Florians.

**Reuben | 06:06**
I mean, it happens to be convenient to us because it was done directly by Florida. So we don't have to rally together a large squad in order to work on this.

**Wesley Donaldson | 06:12**
So we don't have to rally together a large squad in order to work on this.

**Reuben | 06:25**
But it is a quantum problem.

**Wesley Donaldson | 06:25**
But it is a quantum problem.

**Reuben | 06:28**
So.

**Wesley Donaldson | 06:28**
So.

**Reuben | 06:36**
Let me think.

**Wesley Donaldson | 06:36**
Let me think.

**Reuben | 06:37**
What do we need to do?

**Wesley Donaldson | 06:37**
What do we need to do next? Next, I think our next steps are probably going to be I suspect we're going to have to do some prompt engineering.

**Reuben | 06:39**
I think our next step are probably going to be I suspect we're going to have to do some prompt engineering. So the thing about this is that a generic prompt where you just say you are playing the role of quantum expert and you are trying to solve this particular problem may not get a lot of value because, these are large language models, they don't have examples in their.

**Wesley Donaldson | 06:48**
So the thing about this is that a generic prompt where you just say you are playing the role of quantum experts and you are trying to solve this particular problem may not get a lot of value because these large language models, they don't have examples in their least, not a large number of examples in their data.

**Reuben | 07:09**
There's not a large number of examples in their datasets of existing conversations where there was a quantum expert who was doing exactly this kind of work.

**Wesley Donaldson | 07:12**
Set of exist. Conversations. Where there was a quantum expert who was doing exactly this kind of work.

**Reuben | 07:20**
Because this is novel, so we're going to have to give it some additional background.

**Wesley Donaldson | 07:20**
Because this is novel. So we're going to have to give it some additional background.

**Reuben | 07:29**
I see that you have given it a.

**Wesley Donaldson | 07:29**
I see that you have given it a. So you gave it a pront you gave it an example.

**Reuben | 07:34**
So you give it a prompt, you gave it an example, and, you know, let's see if it can generalize if we give it a little bit of additional context, like, for example, a summary of the.

**Wesley Donaldson | 07:39**
And, you know, let's see if you can generalize if we give it a little bit of additional context, like, for example, a summary of the.

**Reuben | 07:52**
Did you give it a summary of the articles that this comes from the research, the QMM article?

**Wesley Donaldson | 07:52**
Did you give it a summary of the articles that this comes from the research, the QM article?

**Nicolas Berrogorry | 07:59**
No, what I did for this first version is I, basically, created like a simple paragraph base like.

**Wesley Donaldson | 07:59**
No, where I did for this first version is I, basically created a simple paragraph page like.

**Nicolas Berrogorry | 08:08**
Here are the examples.

**Wesley Donaldson | 08:08**
Here are the examples.

**Nicolas Berrogorry | 08:09**
Here are the outputs, et cetera.

**Wesley Donaldson | 08:09**
Here are the album et cetera for the ST that appears in the notebook.

**Nicolas Berrogorry | 08:12**
For the sequit that appears in the notebook. So it only has the samples for one one qbit.

**Wesley Donaldson | 08:14**
So it only has the samples for one one Q it look at this.

**Reuben | 08:18**
Okay, it's not.

**Wesley Donaldson | 08:18**
No, I don't think it's going to share less right now.

**Nicolas Berrogorry | 08:19**
But I don't think it's gonna share our lives right now for itself.

**Wesley Donaldson | 08:21**
For example.

**Reuben | 08:22**
Right.

**Wesley Donaldson | 08:23**
Right.

**Reuben | 08:23**
So but the, so I don't think that the large language models.

**Wesley Donaldson | 08:23**
So but the, so I don't think that the large languages model.

**Reuben | 08:28**
I don't think that GPT and or Gemini or Grock actually have examples of work which is done based of this sort.

**Wesley Donaldson | 08:28**
I don't think that GPT or Jim and I or Grock actually have examples of work which is done of this sort.

**Reuben | 08:41**
So they don't know what a quantum expert doing this work does because nobody's ever done it before.

**Wesley Donaldson | 08:41**
So they don't know what a quantum expert is doing in this work does because nobody's ever got it before.

**Reuben | 08:47**
This is novel.

**Wesley Donaldson | 08:47**
It's novel.

**Reuben | 08:49**
And maybe that makes it a little bit unfair.

**Wesley Donaldson | 08:49**
And maybe that makes it a little bit unfair.

**Reuben | 08:53**
Like, we're trying to do at least three things at once.

**Wesley Donaldson | 08:53**
Like, we're trying to do at least three things at once.

**Reuben | 08:56**
First of all, we're trying to create a quantum expert.

**Wesley Donaldson | 08:57**
First of all, we're trying to create a quantum expert.

**Reuben | 08:59**
Second, we're trying to do QMM, which is novel research.

**Wesley Donaldson | 08:59**
Second, we're trying to do Q and them, which is novel research, and the third, we're trying to do fantastic compression.

**Reuben | 09:06**
And the third. We're trying to do. Fchastic compression. So each of these in themselves is a challenging problem.

**Wesley Donaldson | 09:15**
So each of these in themselves is a challenging problem.

**Reuben | 09:25**
But let's see if we could give it some additional context.

**Wesley Donaldson | 09:25**
But let's see if we could give it some additional context.

**Reuben | 09:33**
I want to focus probably on the QMM part of it, which is relatively simple, the stochastic compression.

**Wesley Donaldson | 09:33**
I want to focus probably on the QMM part of it, which is relatively simple, the stochastic compression.

**Reuben | 09:48**
That may be valuable, but if we're trying to test both the stochastic compression and the QMM part at the same time, and we're developing them both at the same time, we won't know what contribution comes from which we won't know how much the stachastic compression is actually improving the results.

**Wesley Donaldson | 09:48**
That may be valuable. But if we're trying to test both the stachastic compression and the QMM part at the same time, and we're developing the most at the same time, we won't know what contribution comes from which we won't know how much this kptic compression is actually improving the results. 
So we need a way of separating these out.

**Reuben | 10:07**
So we need a way of separating these out.

**Wesley Donaldson | 10:12**
But now they are separate, so they are basically when you go, when you open.

**Nicolas Berrogorry | 10:12**
Right now they are separate.

**Reuben | 10:14**
Okay.

**Nicolas Berrogorry | 10:15**
So they are basically when you go, when you open.

**Wesley Donaldson | 10:18**
I started to run this blo can and wif but I'm doing that in as we speak.

**Nicolas Berrogorry | 10:18**
I'm having a little bit of strug to run this project locally. I don't know why, but I'm doing that in the background as we speak, but was just talking.

**Wesley Donaldson | 10:24**
But just talking.

**Nicolas Berrogorry | 10:28**
I can say that we have the Variation producer now right now is very generic and it will intelligently extract like which parameters to show Vim, CP or the UI for example if you need a policyization.

**Wesley Donaldson | 10:28**
I can say that we have the right producal right now is reionary and it will iniently expect like which parameters to show the MCT or the UI for example. Policy realization.

**Nicolas Berrogorry | 10:42**
And I had added these e three samples, 1 the random circuit generator agent or brio producer to the QM Brier producer, the one which has explained that what he's doing now.

**Wesley Donaldson | 10:42**
And I have added these three sales. 1 the random CL generator agent or body producer to the QM bet producer the one which Spain that we're in now and then see the stochastic compression one which in the same way it's like you're a quantum mix that's not going to make it a quan to make start.

**Nicolas Berrogorry | 10:55**
And then three, the stochastic compression one, which in the same naive way, it's like you're a quantum expert blah. 
That's not going to make it a quan to expert. I know.

**Wesley Donaldson | 11:03**
I know.

**Nicolas Berrogorry | 11:04**
And then yeah, basically that's some of the things that I found that actually are interesting that the LM kind of re for example, it does have access to all of the research papers and all of the publications and all of the techniques that are used.

**Wesley Donaldson | 11:04**
And then. And then, yeah, basically that some of the things that I found that actually are interesting that the M can already do. For example, it does have access to all of the research papers and all of the publications and all of the techniques that are used.

**Nicolas Berrogorry | 11:23**
It knows what Q AA is.

**Wesley Donaldson | 11:23**
It knows what AA is. 
I've seen that it is not enough to teach a research engineer like me to a fair amount, so I can follow this.

**Nicolas Berrogorry | 11:26**
I've seen that it knows enough to teach a research engineer like me like to a fair amount so I can follow this. So I don't know the depth like how good it is, already like.

**Wesley Donaldson | 11:35**
So I don't know the depth like how good it is already like.

**Nicolas Berrogorry | 11:42**
But it was able to suggest that there are.

**Wesley Donaldson | 11:42**
But, it was able to suggest that there are an as sort of proted because this is very similar to assembly in many ways.

**Nicolas Berrogorry | 11:45**
And I sort of prompted because this is very similar to assembly in many ways. But like I was able to ask him, like, what?

**Wesley Donaldson | 11:50**
But like, I was able to ask you. Like what?

**Nicolas Berrogorry | 11:54**
Operations.

**Wesley Donaldson | 11:54**
Operations or funding gates or combinations of gates and parameters et cetera can be in certain situations removed?

**Nicolas Berrogorry | 11:55**
Or quantum gates? Or combinations of gates and parameters et cetera, can be in certain situations removed.? Or simplify down into simpler or less amount of parameters of gates.

**Wesley Donaldson | 12:04**
Or simplify down into simpler or less amount of parameters of gaze.

**Nicolas Berrogorry | 12:09**
And it told me that there are a series of permutations that under certain conditions, you can apply to actually reduce the amount of cubits and such on the circuits.

**Wesley Donaldson | 12:09**
And it told me that there are a series of permutations that under certain conditions, you can apply to actually reduce the amount of cubids and such on the stairs.

**Nicolas Berrogorry | 12:18**
And it seems to me like it gave me the intuition that with a little bit of examples and of that we are going to be able to do some meaningful sto acid compression to at least a benchmark, right?

**Wesley Donaldson | 12:18**
And it seemed. It seemed to me like it came in intuition that with a little bit of examples and that we are going to be able to do some meaningful stochastic compression to at least a benchmark right?

**Nicolas Berrogorry | 12:30**
To run it alongside the other ones.

**Wesley Donaldson | 12:30**
To run it alongside the other ones. Create.

**Nicolas Berrogorry | 12:33**
Create data.

**Wesley Donaldson | 12:34**
Data?

**Nicolas Berrogorry | 12:34**
I don't know.

**Wesley Donaldson | 12:34**
I don't know.

**Reuben | 12:37**
Yeah, that sounds plaus.

**Wesley Donaldson | 12:37**
Yeah. That sound possible?

**Reuben | 12:40**
So we I think like I'm saying, if you are right, that it has some general background on quantum computing.

**Wesley Donaldson | 12:40**
So I think like I'm saying, if you are right, that it has some general background on quantum computing.

**Reuben | 12:51**
For example, anything that you would find in the documentation of Kiskit from IBM, it probably has memorized that completely.

**Wesley Donaldson | 12:51**
For example, anything that you would find in the documentation of Kids from AA probably has memorized acly and those are the extensive tutorials.

**Reuben | 12:58**
And those are extensive tutorials.

**Wesley Donaldson | 13:01**
What it won't have is anything specifically about QM because this is not.

**Reuben | 13:01**
What it won't have is anything specifically about QMM because this is novel. So we need probably to give it some context.

**Wesley Donaldson | 13:09**
So we need probably to give it some context.

**Reuben | 13:14**
Let me see if I have the paper.

**Wesley Donaldson | 13:14**
Let me see if I have the paper.

**Reuben | 13:16**
I mean.

**Wesley Donaldson | 13:16**
I mean, it might just be the simple would be I would ask if you can share it this.

**Nicolas Berrogorry | 13:16**
It might just be the simple second I will go to access that paper later if you can share it, please.

**Wesley Donaldson | 13:24**
You haven't okay, well, that may explain some things got hold on moo for all.

**Reuben | 13:24**
You haven't. Okay, well.

**Nicolas Berrogorry | 13:28**
That may explain some things.

**Reuben | 13:30**
Got it. Hold on. Let me look for it.

**Wesley Donaldson | 13:37**
Right guys, well that's it. Achievement accomplished. Most important thing we learned, we had. We were read in the paper.

**Reuben | 13:44**
Wesley, you're a funny guy.

**Nicolas Berrogorry | 13:52**
It may have been good, but you never know in the end, because we had to do a bunch of getting at to speed, you know, and maybe we can read the paper from V Ver crowning.

**Wesley Donaldson | 13:52**
It may have been good, but you never know in the end, because we have to do a bunch of GA to speed, you know, and maybe we can bring the paper from very crowding. Well, I think so.

**Reuben | 14:06**
Well, I think that the so just throwing in the entire paper is probably not the right approach.

**Wesley Donaldson | 14:08**
Just throwing in the entire paper is probably not the right approach.

**Reuben | 14:12**
We need to have an intelligent summary which is concise enough that you can fit it into a reasonable prompt.

**Wesley Donaldson | 14:12**
We need to have an intelligent summary which is concise enough that you can fit it into a reasonable problem.

**Reuben | 14:19**
So let me.

**Wesley Donaldson | 14:19**
So let me.

**Reuben | 14:19**
Let me find the paper.

**Wesley Donaldson | 14:20**
Let me find a bit pive moment.

**Reuben | 14:20**
Just a moment.

**Nicolas Berrogorry | 14:22**
Yeah, and I don't want to scare anyone, but we can, like, add another Epook on top of an existing open source LL M so we don't have to worry.

**Wesley Donaldson | 14:22**
Yeah, and I don't want to scare anyone, but we can like al n on top of having system open source m so we don't have to worry about context.

**Nicolas Berrogorry | 14:35**
Context, saturation.

**Wesley Donaldson | 14:35**
Context saturation.

**Reuben | 15:01**
Okay, here's a link to the paper.

**Wesley Donaldson | 15:01**
Okay, here's a link to the paper.

**Reuben | 15:08**
Now.

**Wesley Donaldson | 15:08**
Don't grab.

**Reuben | 15:08**
Let me grab it. Don know.

**Wesley Donaldson | 15:11**
Don't know me.

**Nicolas Berrogorry | 15:25**
Okay, that's gonna take me a couple hours to.

**Wesley Donaldson | 15:25**
Okay, that's going to take me a couple of hours to I read it, and it would take you more than a couple of hours.

**Reuben | 15:30**
No, I've read it, and it's going to take you more than a couple of hours. Okay, it's novel, but let's see if we could draw it into, say, for example, Claude and get some sense out of it.

**Wesley Donaldson | 15:37**
It is novel. So let's see if we could draw it into, say, for example, Claude and get some sense out.

**Reuben | 15:47**
I mean, if you don't mind, since we're all here, let's just do this exercise.

**Wesley Donaldson | 15:47**
I mean, if you don't mind, because we're all here, let's just do this exercise.

**Reuben | 15:52**
Unless you have some other topics that you need to discuss.

**Wesley Donaldson | 15:52**
Unless you have some other topics that you need to discuss. No.

**Nicolas Berrogorry | 15:55**
No, that's perfect.

**Wesley Donaldson | 15:55**
No, that's. That's. That's perfect basically.

**Nicolas Berrogorry | 15:56**
Yes, is, okay, so what you want me no.

**Wesley Donaldson | 15:59**
What you won't be okay.

**Reuben | 16:00**
No, I'll do okay.

**Nicolas Berrogorry | 16:03**
You're sharing your screen.

**Reuben | 16:05**
Not yet. We go.

**Nicolas Berrogorry | 16:11**
I was able to run the project locally if you want to take a look again at some point.

**Wesley Donaldson | 16:11**
I was able to move around the project if you want to take a at some point.

**Reuben | 16:15**
Okay, yeah, I would appreciate that, but like I say, I mean, let's just try doing some basic prompt engineering.

**Wesley Donaldson | 16:15**
Okay, yeah, I appreciate that, but as just kind of in some basic parts. Engine.

**Reuben | 16:24**
So I will.

**Wesley Donaldson | 16:24**
So I will.

**Reuben | 16:26**
Let's create a project.

**Wesley Donaldson | 16:26**
Let's create a project.

**Reuben | 16:34**
And call it QMM AOR mitigation.

**Wesley Donaldson | 16:34**
And col it QMM Air litigation.

**Reuben | 16:46**
Which screen do you see, by the way?

**Wesley Donaldson | 16:46**
Which screen do you see, by the way?

**Nicolas Berrogorry | 16:49**
The one that contains chlob.

**Wesley Donaldson | 16:49**
The one that contains club quickly.

**Reuben | 16:50**
Okay, good. So we'll do this.

**Wesley Donaldson | 16:52**
So this.

**Reuben | 16:55**
E just I'm going to create this a private project, actually.

**Wesley Donaldson | 17:01**
Just I'm going to create this private project actually.

**Reuben | 17:04**
Wait a minute. 
No, I don't know whether you would have access to this project.

**Wesley Donaldson | 17:06**
No. I don't know whether you would have access to this project.

**Reuben | 17:09**
It would be convenient if we could share a project somehow.

**Wesley Donaldson | 17:09**
It would be convenient if we could share a project somehow.

**Reuben | 17:13**
But for now, I'll just create it.

**Wesley Donaldson | 17:13**
But for now, August is see.

**Reuben | 17:15**
Right, let's see. Describe what we are trying to achieve.

**Wesley Donaldson | 17:23**
Describe what we are trying to achieve.

**Reuben | 17:27**
We are researching methods for improving, quantum circuits running on noisy hardware.

**Wesley Donaldson | 17:27**
We are researching mees for improving content. Circs running on noisy hardware.

**Reuben | 17:54**
I guess that's good enough for now.

**Wesley Donaldson | 17:54**
I mean, I guess that's good enough for.

**Reuben | 17:59**
And let's see where do I add the file?

**Wesley Donaldson | 17:59**
And let's see, where do I head the five period final.

**Reuben | 18:02**
Here we go. Mo I add the file, where did I put it? 
I just downloaded im.

**Wesley Donaldson | 18:13**
He is dull mud he.

**Reuben | 18:33**
Okay uploading the file now.

**Wesley Donaldson | 18:37**
Uploading the file now.

**Reuben | 18:39**
And yes, I realized that nothing that I'm doing here is unfamiliar to you.

**Wesley Donaldson | 18:39**
And yes, I realized that nothing that I'm doing here is unfamiliar to you.

**Reuben | 18:44**
You could probably do every step that I'm implementing, but read the read in summaryize the uploaded document.

**Wesley Donaldson | 18:44**
You could probably do every step that I'm implementing. 
But read the read in summer is the UPLO. 
Uploaded documents.

**Reuben | 19:10**
Focus on let's see, what should we focus on?

**Wesley Donaldson | 19:10**
Focus on. 
See what should we focus on? We focus on the methods for inserting variational quantum circuits.

**Reuben | 19:20**
Focus on the methods for inserting variational quantum circuits. 
Into existing circuits.

**Wesley Donaldson | 19:44**
Into existing circuitircus.

**Reuben | 19:56**
What?

**Wesley Donaldson | 19:56**
What?

**Reuben | 20:01**
This is the experiments which were done.

**Wesley Donaldson | 20:01**
Missed the experiments which were done.

**Reuben | 20:11**
Which ones were on actual QPUS and which were on simulator?

**Wesley Donaldson | 20:11**
Which ones were on actual QP years and which were on simulator.

**Reuben | 20:36**
Yeah, okay, but maybe this is enough for now.

**Wesley Donaldson | 20:36**
Yeah, okay, then this. 
Measurement free errors and pressure lay according to process uses.

**Reuben | 20:54**
Measurement free error suppression layer for disk processors. 
Okay, so this describes the circuits that we are adding.

**Wesley Donaldson | 21:08**
Okay. So. So this describes the sears that we are adding.

**Reuben | 21:13**
So.

**Wesley Donaldson | 21:13**
So.

**Reuben | 21:14**
Single cubit.

**Wesley Donaldson | 21:14**
Single cubit RI rotations and near the controlled R wide gates.

**Reuben | 21:15**
Roy. Rotations and nearest neighbor controlled RY gates retrieval stage hybridization with repetition.

**Wesley Donaldson | 21:25**
Retrieval stage hydriation with repetition during the experiments.

**Reuben | 21:29**
Here are the experiments. Experiments one through seven were actually done on hardware experiment 8 was simulator only, although Experiment H was actually the most diverse of these experiments.

**Wesley Donaldson | 21:34**
Experiments one through seven were actually done on hardware. Experiment 8 was simulated only, although Experiment a was actually the most diverse of these experiments.

**Reuben | 21:56**
Okay, so the key results.

**Wesley Donaldson | 21:56**
Okay. So. Key results.

**Reuben | 21:58**
The QMM plus Web3 reached this fidelity with no additional two Q gates, and the QMM dressed VCUC reduces training loss by 35% while having the run to run variance.

**Wesley Donaldson | 21:58**
Two of them was where three reached this vidility with no additional to Q the gates as the QMM dressed BI produces train loss by 35% having demental variance. Okay.

**Nicolas Berrogorry | 22:25**
Did it say anything about the types of sequences it was applied to?

**Wesley Donaldson | 22:25**
Did it say anything about the types of services? It was applied to?

**Reuben | 22:31**
Yes, let's ask. 
Well, I mean it mentioned one of them.

**Wesley Donaldson | 22:32**
I mean it mentioned one of them.

**Reuben | 22:33**
So rep.

**Wesley Donaldson | 22:33**
So RUS that is like the method for error mutation.

**Nicolas Berrogorry | 22:34**
3 that is like the method for error mitigation. But did it mention, like, which types of secrets were used to apply to 2?

**Wesley Donaldson | 22:39**
But did you mentioned, like, which types of sequences were used to apply to 2?

**Nicolas Berrogorry | 22:44**
Because.

**Wesley Donaldson | 22:44**
Because that's yeah, I mean you mentioned rev three but I would let's ask you there where any word besides sprint.

**Reuben | 22:44**
Yeah, that's yeah, I mean, it mentioned rep. Three. But I was let's ask you if there were any more besides rep. 3.

**Nicolas Berrogorry | 22:57**
Yeah, I think that I didn't explain myself correctly, to be honest, that what I meant and will not miss interrupting your train of thought, but is did this.

**Wesley Donaldson | 22:57**
Yeah, I think that I didn't explain myself correctly to you. That what I meant and we not interrupting your the call. But is this.

**Nicolas Berrogorry | 23:10**
Did Claude mention which circuit QM was applied to like the original ones?

**Wesley Donaldson | 23:10**
Did Claude mention which sequence Qurem was applied to like the original ones?

**Reuben | 23:17**
Because I think we are talking about the same thing.

**Wesley Donaldson | 23:17**
Because I think we are talking about this.

**Reuben | 23:23**
Okay, so Rep 3 is one of them, and it's the one that you have been working with.

**Wesley Donaldson | 23:23**
Okay, so refery is one of them, and this is one that you have been working.

**Reuben | 23:32**
Okay, so the variational yes a variational quantum classifier.

**Wesley Donaldson | 23:32**
Okay, so the variational. Yes a variational quantum class.

**Reuben | 23:37**
VC experiment 7, yeah, VQC and so this one would, probably require some data.

**Wesley Donaldson | 23:39**
Yeah, you can see. 
And so this one would probably requires some data as an actual classifier.

**Reuben | 23:48**
It's an actual classifier.

**Wesley Donaldson | 23:51**
So for quantum machine learning, yes.

**Nicolas Berrogorry | 23:51**
So for quantum machine learning.

**Reuben | 23:53**
Yes. Yes. So this is the most basic quantum machine learning possible.

**Wesley Donaldson | 23:54**
So this is the most basic quantum machine learning possible is where you are just trying to do a binary classification.

**Reuben | 23:58**
It's where you are just trying to classify but do a binary classification.

**Nicolas Berrogorry | 24:03**
So I researched that, for example, the quantum RAM is a problem when you need classical data inputs.

**Wesley Donaldson | 24:03**
So I researched that. For example, the quantum run is a problem when you need class and data input.

**Nicolas Berrogorry | 24:11**
Does PQC require classical inputs?

**Reuben | 24:16**
So you what we do is we don't encode the data as the quantum state, we encode it as rotations.

**Wesley Donaldson | 24:16**
So you what we do is we don't include code the data as the quantum state, we encode it as rotations.

**Reuben | 24:31**
So we as we are inputting the data.

**Wesley Donaldson | 24:31**
So we as we are inputting the data.

**Reuben | 24:35**
So we take the, you know, whatever feature vector.

**Wesley Donaldson | 24:35**
So we take the, you know, whatever feature vector it is and we encode those as rotations, and then we actually create another layer which goes through those rotations.

**Nicolas Berrogorry | 24:38**
It is.

**Reuben | 24:40**
And we encode those as rotations, and then we actually create another layer which goes through those rotations. The rotations are a parameter.

**Wesley Donaldson | 24:47**
The rotations are parameters.

**Reuben | 24:53**
Yeah, so we're encoding the data in the parameters of the circuit itself.

**Wesley Donaldson | 24:53**
Yeah, so we're encoding the data in the parameters of the figures, so.

**Nicolas Berrogorry | 24:57**
Okay, that makes sense to me.

**Wesley Donaldson | 24:57**
Okay, that makes sense to me.

**Nicolas Berrogorry | 24:59**
I can follow that.

**Wesley Donaldson | 24:59**
I can follow that.

**Nicolas Berrogorry | 25:00**
Okay.

**Wesley Donaldson | 25:00**
Okay, multi ML stack.

**Reuben | 25:03**
Multi QMM stacks. Okay.

**Wesley Donaldson | 25:05**
Okay, so it looks like basically what we have right now is V PC and the rest.

**Reuben | 25:06**
So it looks like basically what we have right now is VQ c and the rep 3.

**Wesley Donaldson | 25:13**
T so multila, the memes now run on the actual car, right?

**Nicolas Berrogorry | 25:18**
So the multi layer to a mer run on the actual hardware, right? It was a simulator.

**Wesley Donaldson | 25:25**
It was simulator.

**Reuben | 25:27**
Yeah, this is experimented.

**Wesley Donaldson | 25:27**
This is experiment.

**Reuben | 25:30**
So what they did is they took one, two or three QMM circuits.

**Wesley Donaldson | 25:30**
So what they did is they took one two or three qmmcertain.

**Reuben | 25:35**
You know.

**Nicolas Berrogorry | 25:36**
They. I mean, I very Q it.

**Wesley Donaldson | 25:36**
I miss a very cute. Yeah.

**Reuben | 25:38**
Yeah. Okay, so based on this discussion so far.

**Wesley Donaldson | 25:40**
Okay, so based on this discussion so far.

**Reuben | 25:51**
So far, provide instructions that a researcher in quantum computing could follow to generalize these experiments.

**Wesley Donaldson | 25:51**
So far, provide instructions that a researcher in important computing could follow to generalize these experiments and the results of this probably not going to be that great.

**Reuben | 26:18**
And the results of this are probably not going to be that great. We're going to have to massage it a little bit.

**Wesley Donaldson | 26:23**
We're going to have to masage and that's Friday.

**Nicolas Berrogorry | 26:26**
And that's probably a new paper as well.

**Wesley Donaldson | 26:27**
A new paper as well? It could be, but I mean, that's the point.

**Reuben | 26:29**
It could be, but I mean, that's the point. How smart are these large language models?

**Wesley Donaldson | 26:32**
How smart are these larger language models? 
Yeah. So I know that everyone is doing a system of research, but I don't really know what.

**Nicolas Berrogorry | 26:36**
So I know that everyone is doing sister research, but I don't really know. Like, it's very closed right now, and the people doing it, of course, have their own.

**Wesley Donaldson | 26:43**
It's very close right now, and the people doing it, of course, have their own.

**Nicolas Berrogorry | 26:51**
I guess, like a measurement of how well it works.

**Wesley Donaldson | 26:51**
I guess the measurement of how well it works.

**Nicolas Berrogorry | 26:54**
But I've seen some news about some papers that come up that basically say Claude was here or something like that because it was used, using cla I think it's mostly like math paper like proofs, like some proofs that are very weird to create e for classical math.

**Wesley Donaldson | 26:54**
But I've seen some news about some papers that come up that basically say Claude was here or something like that because it was used, using glove. I think it's mostly like Mac paper like proofs. Like some proofs that are very weird to. To create and for classical math, but I don't know that we will have to see how well it does through years.

**Nicolas Berrogorry | 27:18**
But I don't know, like, we will have to see how well it does to you.

**Reuben | 27:29**
Okay.

**Nicolas Berrogorry | 27:32**
I can see that for now, it's trying to encompass everything.

**Wesley Donaldson | 27:32**
I can see that for now it's trying to encompass everything.

**Nicolas Berrogorry | 27:38**
And since this is gonna run in context that we might have to frink the objectives and maybe consider talking about in open to SM 3.

**Wesley Donaldson | 27:38**
And since this is gonna run in context that we might have to prepar the objectives and may consider talking about in open TOS &T yes, we could definitely refine this because in fact this is way too long.

**Reuben | 27:48**
Yes, we could definitely refine this. In fact, this is way too long.

**Wesley Donaldson | 27:54**
Yeah, it the entire thing reports that.

**Nicolas Berrogorry | 27:54**
Yeah, it's trying to do the entire thing. [Laughter] Yeah, okay, report like.

**Reuben | 28:04**
Well.

**Wesley Donaldson | 28:04**
Well, I couldn't read these as at some point.

**Nicolas Berrogorry | 28:05**
I'm going to read these outputs at some point.

**Reuben | 28:11**
Well, so what I suggest right now is that we you follow up.

**Wesley Donaldson | 28:11**
Well, so what I suggest right now is that we follow up.

**Reuben | 28:20**
This is a good start.

**Wesley Donaldson | 28:20**
This is a good start, but far more general than we need.

**Reuben | 28:25**
But. But far more general than we need. 
Let's see.

**Wesley Donaldson | 28:38**
Let's see.

**Reuben | 28:40**
So what does it have?

**Wesley Donaldson | 28:40**
So where does it have?

**Reuben | 28:44**
Let's let us remove some of this, make the rest more concise.

**Wesley Donaldson | 28:44**
Let. Let us remove some of this, make the rest more concise constructions more than size.

**Reuben | 29:03**
Instructions more concise. 
And focus on particular cases.

**Wesley Donaldson | 29:11**
And focus on particular cases.

**Reuben | 29:23**
Assume that the researcher starts with an existing circuit.

**Wesley Donaldson | 29:23**
Assume that the researcher starts with an existing circuit.

**Reuben | 29:46**
This may be a, purely.

**Wesley Donaldson | 29:46**
This may be a purely a.

**Reuben | 30:00**
Algorithmic th circuit.

**Wesley Donaldson | 30:00**
Algorithmic. It appears like, let's say, as sure as I know, Robt, I literally was researching those hands today, and I thought that it might be really interesting.

**Reuben | 30:07**
Like, let's say your algorithm, grover's algorithm.

**Nicolas Berrogorry | 30:27**
I literally was researching those funs today, and I thought that it might be really interesting. So, you know, the line of work that Sam pushed to be able to provide a researcher, like the ability to convert a classical to quantum and have it run and have it like some, like hybrid.

**Wesley Donaldson | 30:35**
So you know the line of work that some pushed to you to provide a researcher inability to convert a classical to quantum and how it run and how it like some like hybrid.

**Nicolas Berrogorry | 30:50**
It would be like a very dammy way to test it.

**Wesley Donaldson | 30:50**
It would be like a very dummy way to test it.

**Nicolas Berrogorry | 30:54**
It would be can it convert like a can it detector.

**Wesley Donaldson | 30:54**
It will we can it convert the can it detect an algorithm into factorization and replace it with AQS and C sure to find the parameters and can we like look and re run the sequence for recombine the sequels for different ends until we get one of the factorization.

**Nicolas Berrogorry | 30:57**
An algorithm is doing factorization and replace it with a QS and three way short algorithm to find the parameters and. 
And can we like loop and re run the sequence for. Recompile the sequence for different end until we get, like, all of the factory station using our or like five plan or our IO.

**Wesley Donaldson | 31:17**
We using our E like pipeline or our IO I calling to see how.

**Nicolas Berrogorry | 31:24**
It'll be a cool thing to see happening. [Laughter].

**Reuben | 31:28**
Yeah. Okay, so let's see.

**Wesley Donaldson | 31:30**
Okay, so let's see.

**Reuben | 31:31**
It might be a purely algorithmic circuit, like Sch's algorithm or Grover's algorithm.

**Wesley Donaldson | 31:31**
It would be a theory underm circuit like SM or prosrim. It might be a very little algorithm like A VQC or QAOA.

**Reuben | 31:36**
It might be a very general algorithm, like a VQC or, QAOA. The challenge in each of these cases is how to design the.

**Wesley Donaldson | 31:51**
The challenge in each of these cases. And how to design the.

**Reuben | 32:11**
QMM layers based on the QM based on QMM primitive.

**Wesley Donaldson | 32:11**
QMM players based on the can you have premise.

**Reuben | 32:33**
And then how to, append to the existing circuit.

**Wesley Donaldson | 32:33**
And then how to append to the existing circuit.

**Reuben | 32:56**
Given in open chasm.

**Wesley Donaldson | 32:56**
Even in open. An will you mention CAS open doesn't free the PO specificly because it has got more feature some days and finally test the performance the resulting modified circuit.

**Nicolas Berrogorry | 33:06**
Will you mention custom 3 do all specifically because it has more features and gates.

**Reuben | 33:14**
We' go and, finally test the performance the resulting, modified circuit. 
Where did you go?

**Wesley Donaldson | 33:46**
Where you go hopefully it's not a app and you didn't so that prompt no where is it?

**Nicolas Berrogorry | 33:49**
Hopefully it's not at work and you didn't you all that prompt?

**Reuben | 33:52**
No, where is it? But there it is.

**Wesley Donaldson | 33:54**
But that was a huge scare was scary.

**Reuben | 33:56**
I don't know.

**Nicolas Berrogorry | 33:57**
That's okay. Yeah, wow, that was a huge scare.

**Reuben | 34:02**
It was scary. Yes. Okay, so I'm just going to let it produce an excessively.

**Wesley Donaldson | 34:07**
Okay, so I'm just going to let it produce an excessively.

**Reuben | 34:13**
This is still going to be too long.

**Wesley Donaldson | 34:13**
It's still going to be too long.

**Reuben | 34:16**
Okay, so it's explaining the QMM primitive.

**Wesley Donaldson | 34:16**
Okay, so it's playing the C and privileges.

**Reuben | 34:18**
That seems to be very similar.

**Wesley Donaldson | 34:18**
That seems to be very similar because I need the QMM layer for circuit.

**Reuben | 34:21**
Designing the QMM layer for your circuit. Let's see, practical.

**Nicolas Berrogorry | 34:33**
This is going to be interesting.

**Wesley Donaldson | 34:33**
This is going to be interesting.

**Nicolas Berrogorry | 34:35**
Like, I don't think it's going to generalize that, I think at some point I read, basically what the paper already says.

**Wesley Donaldson | 34:35**
I don't think it's going to push in. 
I think at some point I read basically what the paper already says like now the paper already applies TM to it.

**Nicolas Berrogorry | 34:48**
Like, now the paper already applies QMM to it, so.

**Wesley Donaldson | 34:52**
So yeah.

**Reuben | 34:57**
Well, so actually, let's take a look.

**Wesley Donaldson | 35:01**
So actually take a look.

**Reuben | 35:04**
So appending the QM M layers to an open chasm circuit.

**Wesley Donaldson | 35:04**
So intending the KI memory to an open cating circuit.

**Reuben | 35:08**
So we define the QMM layers as a gate.

**Wesley Donaldson | 35:08**
So we define the qlm layers as the gate.

**Reuben | 35:13**
And yes, indeed, this is almost exactly from the paper, right?

**Wesley Donaldson | 35:13**
And yes, indeed, this is almost exactly from the paper.

**Reuben | 35:19**
These are the rotation gates.

**Wesley Donaldson | 35:19**
These are the rotation games and these are the cris all over the control swab.

**Reuben | 35:21**
The and these are the it looks like the cry gates, followed by the controlled swap.

**Wesley Donaldson | 35:35**
I'm searching into the existing circuit and zarching into variational search.

**Reuben | 35:35**
Inserting into an existing circuit and inserting into variational circuits. Actually, this might be okay.

**Nicolas Berrogorry | 35:51**
You do you want me to send you like the prompt I already have and ask it toly all of his knowled knowledge to it.

**Wesley Donaldson | 35:52**
Do you want me to send you that? The. The prompt. I out and ask it to apply is not that's a good idea.

**Reuben | 36:01**
That's a good idea. I think you have sent it to me.

**Wesley Donaldson | 36:02**
I think you have sensitive let me check in Slack.

**Reuben | 36:04**
Let me check in Slack.

**Nicolas Berrogorry | 36:06**
Yeah, that should still be the latest version.

**Wesley Donaldson | 36:06**
Yeah that should still be the latest version one yes.

**Nicolas Berrogorry | 36:10**
Okay.

**Reuben | 36:17**
Yes. Okay, so is this right?

**Wesley Donaldson | 36:18**
Okay, so this is great.

**Nicolas Berrogorry | 36:24**
I'm gonna, like, version the agents so we can compare them against each other, if that make sense.

**Wesley Donaldson | 36:24**
I'm going to let version variations so we can compare them against each other. It that make sense?

**Reuben | 36:39**
Okay, so I'm just gonna do the dumb thing and just paste this entire mess in.

**Wesley Donaldson | 36:39**
Okay, so I'm just gonna do the dumb thing and just paste this entire mess in.

**Reuben | 36:47**
It makes sense. On it.

**Wesley Donaldson | 36:49**
I think you can the top button share and should be able to download actually this part on the right side.

**Speaker 4 | 36:49**
I think you can the top right button share and it should be able to download actually this part on the right side.

**Reuben | 36:58**
No, sorry, that's not what I mean.

**Wesley Donaldson | 36:59**
No, that's not what I mean.

**Reuben | 37:01**
I'm going to paste in what Nikko gave me.

**Wesley Donaldson | 37:01**
I'm going to paste in with miko GA.

**Reuben | 37:05**
Okay, yeah, and see if it's smart enough to augment that promps.

**Wesley Donaldson | 37:05**
Okay, yeah, see if it's smart enough to augment that.

**Reuben | 37:11**
Okay, sorry, here is an existing prompt.

**Wesley Donaldson | 37:11**
Okay, sir, there is an existing prompt.

**Reuben | 37:16**
And yes, I'll share this with you.

**Wesley Donaldson | 37:16**
And yes, they all shares.

**Reuben | 37:17**
I mean, it's simple enough.

**Wesley Donaldson | 37:18**
I mean, simple enough.

**Nicolas Berrogorry | 37:19**
Yes, I will ask that maybe you don't, send it the entire file, but actually pas the content of the specific prompts because the file contains the stochastic prompt too.

**Wesley Donaldson | 37:19**
Yeah, I would ask that maybe you don't send it the entire file, but actually paste the contents of the specific prompt because the file contains the TOPLASTIC prompt too.

**Reuben | 37:33**
Okay, hold on.

**Wesley Donaldson | 37:33**
Okay, hold.

**Reuben | 37:35**
So just the one apply seven error correction schemes bear rep, 3qml.

**Wesley Donaldson | 37:35**
So just the one applied seven Eric Ricken skiing fair rep three two. No, so this looks like looks second is two and the second.

**Reuben | 37:45**
So this looks like there's two in the second. Okay, yeah, I'm going to skip this.

**Wesley Donaldson | 37:53**
Okay, yes, I very good with great schastic profession.

**Reuben | 37:55**
Stochastic compression.

**Wesley Donaldson | 37:56**
Yes, I can do that.

**Reuben | 37:56**
Yes, I can do that. Here is an existing prompt.

**Wesley Donaldson | 38:00**
Here is an existing province.

**Reuben | 38:08**
Here is an existing pront.

**Wesley Donaldson | 38:08**
Here is an existing process.

**Reuben | 38:19**
Prompt that we have been using to automate some of the work.

**Wesley Donaldson | 38:19**
Some that we have been using to automate some of the work.

**Reuben | 38:30**
Augment this prompt with the instructions that we have just discussed.

**Wesley Donaldson | 38:30**
Augment is prompt with the instructions that we have just discussed.

**Reuben | 38:51**
Then very stupidly copy an existing prompt into a monstrous godlike intelligence and [Laughter] have it tell me how to tell it what to do.

**Wesley Donaldson | 38:51**
Then very stupidly copy an existing prompt into a monstrous godlike intelligence and have it tell you have to tell her what to do.

**Reuben | 39:12**
Okay?

**Wesley Donaldson | 39:12**
Okay.

**Reuben | 39:13**
You are a quantum computing expert.

**Wesley Donaldson | 39:13**
You are a quantum computing expertecialized okay rule so most of the like architecture called that engineer inside of the prompts might be reus here.

**Reuben | 39:14**
Specialized. Okay. Rules alright.

**Nicolas Berrogorry | 39:25**
So most of the like architecture code like engineering side of the prompts might be reused here.

**Reuben | 39:34**
I think so.

**Wesley Donaldson | 39:34**
I think so.

**Reuben | 39:36**
I think so. Okay, identified the why do you keep doing that?

**Wesley Donaldson | 39:38**
Okay, I guess by the why you be doing that?

**Reuben | 39:43**
My goodness, what is going on here?

**Wesley Donaldson | 39:43**
What's in this? What is going on here?

**Reuben | 39:45**
They've changed the UI for some reason, I keep accidentally navigating away from this.

**Wesley Donaldson | 39:45**
They've changed the new I for some reason I keep accidentally navigating away from this.

**Reuben | 39:51**
Where did it go? Man, it is.

**Wesley Donaldson | 39:56**
The souit is complete correct kind a lot of this identical to what you.

**Reuben | 39:57**
So let's see if it's complete. NER correction types. A lot of this looks like identical to what you yeah.

**Wesley Donaldson | 40:10**
Yeah, I think you get the examples, but now it has multi gate examples.

**Nicolas Berrogorry | 40:10**
I think you kept the examples. But now it has multiquit examples. Okay, nice.

**Wesley Donaldson | 40:21**
Okay, I but I don't feel that they've improved it that much.

**Reuben | 40:24**
But I don't see that it's improved that much. It looks so close to what you already did.

**Wesley Donaldson | 40:28**
It's so close to what you already did.

**Nicolas Berrogorry | 40:31**
I may have already had, like, a promp there.

**Wesley Donaldson | 40:31**
I may have already had like a from there.

**Nicolas Berrogorry | 40:34**
[Laughter].

**Reuben | 40:35**
No, it wasn't bad, but there are some things that I saw, yeah, would have been good to add.

**Wesley Donaldson | 40:35**
It wasn't bad but there are some things that I saw yeah would been okay so let's see yeah I didn't have that at all that's new this is I think it might be I'm examples alright.

**Reuben | 40:40**
Okay, so let's see, like for example, what? [Laughter].

**Nicolas Berrogorry | 40:44**
Yeah, I didn't have that at all.

**Reuben | 40:47**
Okay.

**Nicolas Berrogorry | 40:47**
All of that is new.

**Reuben | 40:49**
This is the improvement then.

**Nicolas Berrogorry | 40:51**
I think it might be. And the multi cubit examples.

**Reuben | 40:55**
Okay, alright.

**Nicolas Berrogorry | 41:06**
I can paste it and try to use it on, I don't know, QA or something.

**Wesley Donaldson | 41:06**
I can paste it and try to use it on I don't know. QAs let me just copy this I got give this it's the same for me profile cubriage we'll call this.

**Reuben | 41:12**
Yeah, let's try it. Here, let me just copy this. I will how should I give this to you? Slack it or something.

**Nicolas Berrogorry | 41:20**
Slack or soon to yournest it's the same for me.

**Reuben | 41:24**
Okay, so I'll create a file a cubridge. I'll call this.

**Wesley Donaldson | 41:39**
I think all that too you'll never remember what that is three months something more specific.

**Reuben | 41:45**
You'll never remember what that is three months from now. Something more specific. So when did you call the original?

**Wesley Donaldson | 41:49**
So when did you probably the original.

**Nicolas Berrogorry | 41:53**
To be honest, it's just like instructions, instruction, presets. 
And it's in a file.

**Reuben | 41:58**
Okay, so I'm going to call this QMM application instructions, the QMM augmentation instructions.

**Wesley Donaldson | 41:58**
Okay, so here to call this QMM, application instructions, QM augmentation instructions.

**Reuben | 42:17**
Instructions. And I'm going to call this 2.0 dot MD and no, it didn't give this M good MD format buff.

**Wesley Donaldson | 42:19**
And then we could call this 2.0 dot ND. 
No, we didn't give it could be one that, but it's a text file here.

**Reuben | 42:39**
It's a text file. Here we go.

**Wesley Donaldson | 42:40**
You and I will Slack it to you and them or just.

**Reuben | 42:41**
And I will Slack it to you and dumb or just. I mean, either one is like an echo.

**Wesley Donaldson | 42:45**
I mean, minio and.

**Reuben | 42:50**
And here is I just like. No, yes, you guys can share it. And understand that even as I'm doing this, I really don't feel that any of the steps that I've done are particularly brilliant.

**Wesley Donaldson | 43:11**
I understand that even as I'm doing this, I really don't feel that any of the steps that I've done are particularly brilliant. This seems like an incentive stuff at this point.

**Reuben | 43:19**
Seems like it is standard stuff at this point. You got it? Yeah, okay, there you go.

**Wesley Donaldson | 43:27**
Yep. 
Okay, there you go.

**Nicolas Berrogorry | 43:32**
Let's try to copy.

**Wesley Donaldson | 43:32**
Let's check. A cope.

**Nicolas Berrogorry | 43:34**
And run it.

**Wesley Donaldson | 43:34**
And run it. To who else move.

**Nicolas Berrogorry | 43:35**
Who knows.

**Wesley Donaldson | 44:04**
Trying to.

**Reuben | 44:05**
To.

**Nicolas Berrogorry | 44:08**
Sorry, it is taking more than it should.

**Wesley Donaldson | 44:08**
Sorry, this is taking more than as relax and we're actually I think we're at time right now, so the time is what we want it to be.

**Reuben | 44:12**
Relax and we're actually I think we're at time right now, so is this okay, let's spend a few more minutes?

**Wesley Donaldson | 44:23**
I mean, honestly, Ruben, it's on you. If you have the bandwidth, we'd love to continue the conversation as nice.

**Reuben | 44:29**
Yes, why not?

**Wesley Donaldson | 44:30**
Appreciate.

**Nicolas Berrogorry | 44:33**
Yeah, thank you.

**Wesley Donaldson | 44:33**
Yeah, thank you.

**Nicolas Berrogorry | 44:34**
I am done pasting in the new prompt.

**Wesley Donaldson | 44:34**
I am done facing in the new proms.

**Nicolas Berrogorry | 44:40**
It has a lot more text in it than before, and I can share my screen and we can see if it can run it.

**Wesley Donaldson | 44:40**
It has a lot more pacreen than before and I can share my screen and we can see if it can run it.

**Reuben | 44:50**
Let's see. Let's do it.

**Nicolas Berrogorry | 44:57**
Let me know if you can see my screen.

**Wesley Donaldson | 44:57**
Let me know if you can see my screen.

**Nicolas Berrogorry | 45:03**
It works.

**Wesley Donaldson | 45:03**
It works.

**Nicolas Berrogorry | 45:05**
Okay, so if I open a preexisting pipeline.

**Wesley Donaldson | 45:05**
Okay. So if I open a pre pipeline.

**Nicolas Berrogorry | 45:10**
For example, here is processing the pipelines, instracting the parameters.

**Wesley Donaldson | 45:10**
For example, he is processing the pipeline, instructing the parameters.

**Nicolas Berrogorry | 45:17**
And now we have the.

**Wesley Donaldson | 45:17**
And now we have the pros.

**Nicolas Berrogorry | 45:24**
Do we have the new pron? 
Okay, now you are.

**Wesley Donaldson | 45:31**
Okay, now we.

**Nicolas Berrogorry | 45:36**
So if we have a new prompt, we are going to tell it to only use TMM repsim.

**Wesley Donaldson | 45:36**
So we have new prompt we are going to take it to want to use PM recine.

**Nicolas Berrogorry | 45:49**
And it's going to be applied to a random circuit.

**Wesley Donaldson | 45:49**
And it is going to be applied to a random sequen.

**Nicolas Berrogorry | 45:51**
Now we need to apply it to an input sequen that we provide.

**Wesley Donaldson | 45:51**
Now we need to apply it to an input set that we provide.

**Nicolas Berrogorry | 46:00**
Will you ask on your cloth and face our Slack maybe proven the open QSM like val non QMM QAa circuit.

**Wesley Donaldson | 46:00**
Will you ask on your clothes and base or Slack maybe fent the OQSM like or non QM QA a secret?

**Reuben | 46:17**
Okay, so a QAOA circuit depends on the problem that you are trying to solve.

**Wesley Donaldson | 46:17**
Okay, so AQA circuitirteen depends on the problem that you are trying to solve.

**Reuben | 46:22**
So some of them are very large.

**Wesley Donaldson | 46:22**
So some of them are very large.

**Reuben | 46:25**
Let me give you.

**Wesley Donaldson | 46:25**
Let me give you shar again.

**Reuben | 46:27**
Sure. Again. So.

**Wesley Donaldson | 46:30**
So all of these.

**Reuben | 46:30**
So all of these. The size of the circuit depends on the problem that you are trying to solve.

**Wesley Donaldson | 46:32**
The size of this therapy depends on the problem that you are trying to solve.

**Reuben | 46:36**
However, let me give you the KISS kit tutorial.

**Wesley Donaldson | 46:36**
However, let me give you the kids kit tutorial.

**Reuben | 46:44**
Which one of these do you want to tackle first?

**Nicolas Berrogorry | 46:48**
Anyone to the honest.

**Wesley Donaldson | 46:48**
To be honest, just something that we can run.

**Nicolas Berrogorry | 46:49**
Just something that we can run.

**Reuben | 46:54**
The QAOAT tutorial. This is a pretty good one, but when you look at it, you're going to see that it's very general.

**Wesley Donaldson | 46:56**
This is a pretty good one, but when you look at it, you're going to see that it's very general.

**Reuben | 47:04**
Okay.

**Nicolas Berrogorry | 47:05**
Yeah, so I was looking at it, in the next, let me see if this is the TED I saw the other day.

**Wesley Donaldson | 47:05**
Yeah, so I was looking at it. Let me see if this is a serializedy the other day.

**Nicolas Berrogorry | 47:12**
No, I don't think it is.

**Wesley Donaldson | 47:12**
No, I don't think it is.

**Nicolas Berrogorry | 47:13**
Yeah, it seems like it is.

**Wesley Donaldson | 47:13**
Yeah, it's. It is it a scroll back up to that.

**Reuben | 47:15**
Yes. That's it. That's it. So. Right there, take a look. So scroll back up to that diagram that showed that graph.

**Nicolas Berrogorry | 47:24**
Okay.

**Wesley Donaldson | 47:24**
Okay, so what we're trying to do here, let's grow up to that very thing.

**Reuben | 47:26**
So what we're trying to do here and scroll up to that diagram. So we're trying to solve the max cut problem.

**Wesley Donaldson | 47:30**
So we're trying to solve the max cut problem.

**Reuben | 47:36**
And so the size of the QAA circuit is going to depend on the size of the graph that you're trying to apply the max cut to.

**Wesley Donaldson | 47:36**
And so the size of the QA circuit is going to depend on the size of the graph that we're trying to apply the max.

**Reuben | 47:49**
And so this is a very small example.

**Wesley Donaldson | 47:49**
And so this is a very solid thing.

**Nicolas Berrogorry | 47:53**
But, it looks small.

**Wesley Donaldson | 47:53**
But. It looks small.

**Nicolas Berrogorry | 47:55**
But does it have like a 500 cubit or.

**Wesley Donaldson | 47:55**
But does it have like a 500 cubit or.

**Reuben | 47:59**
No, okay, this is not a 500 cubit problem, so.

**Wesley Donaldson | 47:59**
No, okay, this is not a 500 cubic problem, but if you add node to the graph, then it does.

**Reuben | 48:05**
But if you add nodes to the graph, then it does the graph gets larger.

**Wesley Donaldson | 48:10**
The graph gets larger.

**Reuben | 48:11**
I'm sorry, the circuit gets larger.

**Wesley Donaldson | 48:11**
I'm sorry. The circuit gets larger.

**Nicolas Berrogorry | 48:14**
I look at that, it's building this the so there's some way to build the sequence from the graph.

**Wesley Donaldson | 48:14**
And if that is building this. 
So there's a way to build the circuit from the graph.

**Reuben | 48:20**
Yes.

**Wesley Donaldson | 48:20**
Yes.

**Nicolas Berrogorry | 48:22**
Okay, we are not going to be able to do that now, but I can probably ask it to create an AQSM3 circuit that solves one very small cat problem.

**Wesley Donaldson | 48:22**
Okay, we are not going to be able to do that now, but I can probably ask it to create a QS and 3 circuit that solves one very small CA problem.

**Nicolas Berrogorry | 48:39**
But let me try to do that.

**Wesley Donaldson | 48:39**
Let me study. A.

**Reuben | 48:54**
It might be a good idea to give it the original tutorial web page.

**Wesley Donaldson | 48:54**
It might be a good idea to give it the original tutorial web page.

**Reuben | 49:00**
Okay, reference.

**Wesley Donaldson | 49:00**
Okay? That there's a chance that it's inch or that it is going abroad and they see what it does.

**Nicolas Berrogorry | 49:03**
There's a chance that it's in chested or that it's going abros and let's see what it does.

**Wesley Donaldson | 49:09**
The scret here solve a very small smax C problem.

**Nicolas Berrogorry | 49:09**
Sect. Tele. To solve a very small max cut problem. 
Okay, is a or V QA.

**Wesley Donaldson | 49:24**
Okay, this is a this is the QAOA.

**Reuben | 49:27**
This is a, this is the Q AA.

**Nicolas Berrogorry | 49:30**
Okay, because coincidentally, the title here says Variation I quantum. 
My reasons.

**Wesley Donaldson | 49:37**
Well, okay, so a QAOA is an example of a very nove corporate algorithm.

**Reuben | 49:37**
Well, okay, so. So the AQAOA is an example of a very novel quantum algorithm. So what happens is it constructs the circuit, but it constructs a parameterized circuit whose parameters depend on the graph, and then it optimizes it.

**Wesley Donaldson | 49:44**
Okay, what happens is it constructs the circuit, but it constructs the parameterized circuit. Those parameters depend on the graph, and then it optimizes is actually it doesn't have a way of solving it directly.

**Reuben | 49:57**
It's actually it doesn't have a way of solving it directly. It has to optimize the circuit first.

**Wesley Donaldson | 50:04**
It has to optimize the circuit.

**Nicolas Berrogorry | 50:10**
But it's not like it's another type of optimization.

**Wesley Donaldson | 50:10**
But it's not like it's another type of optimization.

**Nicolas Berrogorry | 50:13**
It's not like a the QMM optimization.

**Wesley Donaldson | 50:13**
It's not like a QMM optimization.

**Reuben | 50:17**
So what you're going to be doing, and I don't know exactly how you're going to explain it to your quantum expert is that you are applying you are adding variational quantum layers to an existing variational quantum circuit.

**Wesley Donaldson | 50:17**
So what you're going to be doing, and I don't know exactly how you're going to explain it to your quantum expert is that you are applying you are adding variational quantum layers to an existing variational quantum circuit.

**Reuben | 50:35**
What is the best way to do that?

**Wesley Donaldson | 50:35**
What is the best way to do that?

**Reuben | 50:37**
Honestly, I don't know myself.

**Wesley Donaldson | 50:37**
Honestly, I don't know myself. Okay, he gave me something I triangle.

**Nicolas Berrogorry | 50:44**
Okay, he gave me something, a triangle. It has some sort of cost function.

**Wesley Donaldson | 50:53**
It had some sort of co function Hamiltonian.

**Nicolas Berrogorry | 50:55**
Hamiltonian. I don't know what this is, what an ansets is, but it looks like a quantum, function.

**Wesley Donaldson | 50:59**
I don't know what this is. What anset is, but it looks like a quantum, function.

**Nicolas Berrogorry | 51:16**
Okay, so I understand, minimization problems.

**Wesley Donaldson | 51:16**
Okay, so I understand the miniimization problems.

**Nicolas Berrogorry | 51:22**
So GA the composition that's ready for extraction?

**Wesley Donaldson | 51:22**
So gay composition that's really for extraction now is to re exponential, right?

**Nicolas Berrogorry | 51:28**
No, it's to this exponential, right?

**Wesley Donaldson | 51:34**
Pretty exponent.

**Nicolas Berrogorry | 51:34**
The exponent. I am not entirely sure of the operations that are going on here, but we have a circuit we run in.

**Wesley Donaldson | 51:35**
I am not entirely sure of the operations that are going on here, but we have a circuit run is a tiny one.

**Reuben | 51:41**
Yep, you got a circuit. This is a tiny one, it looked like it created a triangular.

**Wesley Donaldson | 51:45**
It looks like it created a triangular, just a triangle.

**Reuben | 51:48**
Just a triangle. So you're.

**Wesley Donaldson | 51:49**
So the graph that you're trying to apply the max cut to is just a triangle?

**Reuben | 51:50**
Yeah, the graph that you're trying to will play the max cut to is just a triangle.

**Nicolas Berrogorry | 51:54**
Yeah, so we do.

**Wesley Donaldson | 51:54**
Yeah. So.

**Nicolas Berrogorry | 51:57**
Okay, I know, let's do.

**Wesley Donaldson | 51:57**
Okay, I know, let's do so.

**Nicolas Berrogorry | 52:00**
So gamma beta, it's suggested these values and the parameter extractor already identify the parameters, so I'm just pasting the values of these parameters into the extractor and we have an expected output.

**Wesley Donaldson | 52:01**
Gamma beta it'sted these values and the parameter extractor really identify the parameters, so I'm just basing the values of these brames CTO a extractor. 
Okay, and we can expected output.

**Nicolas Berrogorry | 52:15**
So what?

**Wesley Donaldson | 52:15**
So what would be the expected outcome?

**Nicolas Berrogorry | 52:17**
What would be the expected output? Because maybe here we realize that our way to specify a single value as expected output is very limited.

**Wesley Donaldson | 52:21**
Because maybe here we realize that our way to specify a single value as expected outlook is very limited.

**Nicolas Berrogorry | 52:40**
I think I will run it anyways, you know?

**Wesley Donaldson | 52:40**
I think I would run it anyway, you know.

**Nicolas Berrogorry | 52:42**
So here's a diagram of the circuit.

**Wesley Donaldson | 52:42**
So here is a diagram of the syquy.

**Nicolas Berrogorry | 52:46**
We want to apply QM rep symmetry to it.

**Wesley Donaldson | 52:46**
We want to apply red symmetry to it using those insertions.

**Nicolas Berrogorry | 52:49**
Using those instructions we are going to take this.

**Wesley Donaldson | 52:51**
We are going to take this straighter.

**Nicolas Berrogorry | 52:53**
Lets try to use the air mind. 
I don't need this one.

**Wesley Donaldson | 52:56**
I don't need this one.

**Nicolas Berrogorry | 52:57**
So here we are going to see the QMM variant.

**Wesley Donaldson | 52:57**
So here we are going to see the Q and buyant.

**Nicolas Berrogorry | 53:03**
And then the parameter of theimizer should show the same, but with the human params optimized.

**Wesley Donaldson | 53:04**
Then the parameter of theor should show us the same. But with the human params optimized.

**Nicolas Berrogorry | 53:11**
And yeah, it's gonna run and swe noise swee bit.

**Wesley Donaldson | 53:12**
Yeah. It's gonna run and see noise with it.

**Nicolas Berrogorry | 53:15**
Okay, I'm running it.

**Reuben | 53:18**
Okay.

**Wesley Donaldson | 53:27**
No.

**Reuben | 53:40**
So here's a suggestion.

**Wesley Donaldson | 53:40**
So here's the suggestion.

**Reuben | 53:42**
Yeah, it's cool that it's doing the VQ.

**Wesley Donaldson | 53:42**
Yes, it's cool. That is doing the VQ, the Q AA, but there's the example which should be in the notebook where it does a VQC try that one as well.

**Reuben | 53:47**
The QAOA. But there's the example which should be in the notebook where it does a VQ C try that one as well. Have you tried that way?

**Wesley Donaldson | 54:01**
Have you tried that way?

**Nicolas Berrogorry | 54:02**
No, not at all.

**Wesley Donaldson | 54:02**
No, not at all.

**Reuben | 54:04**
Okay, yeah, try TED, that one that's the Simplest Variational Quantum Circuit that you could Possibly design.

**Wesley Donaldson | 54:04**
Okay, yeah, try to try that way that's the Simplest Variational Quant of the Circuit you could Possibly design.

**Nicolas Berrogorry | 54:11**
Okay, I will do that right next.

**Wesley Donaldson | 54:11**
Okay, I will. Right, next.

**Nicolas Berrogorry | 54:24**
So I don't think he is.

**Wesley Donaldson | 54:24**
So I don't think he is.

**Nicolas Berrogorry | 54:30**
I don't even know how to, like, because these graphs are not made for this.

**Wesley Donaldson | 54:30**
I don't even know how to, like, eat. These graphs are not made for.

**Nicolas Berrogorry | 54:35**
Thank.

**Reuben | 54:36**
Yeah, yes, you're so you're trying to optimize something where suddenly you don't care just about a single cubit output you care about all of the cubids.

**Wesley Donaldson | 54:36**
Yeah, yes, you're so you're trying to optimize something where suddenly you don't care just about a single cubit outfit, you care about all of your teams.

**Reuben | 54:49**
So I think you're going to have to modify your approach.

**Wesley Donaldson | 54:49**
So I think you're going to have to modify your approach.

**Reuben | 54:51**
But that's why I suggest that first, before you do this.

**Wesley Donaldson | 54:51**
But that's why I suggest that first, before you do this.

**Reuben | 54:54**
Okay, you attempt it with the VQC, which is just classifying with a single cubit.

**Wesley Donaldson | 54:54**
Okay, you attempted with the DC, which is just classifying with a single cubit.

**Nicolas Berrogorry | 55:03**
So you're saying that the notebook here.

**Wesley Donaldson | 55:03**
So you're saying that the notebook here, the original notebook hass on BBC?

**Nicolas Berrogorry | 55:05**
The original notebook, has some PGC in it?

**Reuben | 55:09**
I want you to verify that.

**Wesley Donaldson | 55:09**
I want you to verify that.

**Reuben | 55:12**
But it's just grabbed in the paper.

**Wesley Donaldson | 55:12**
But it's just drabed in the paper. Okay, so maybe you can try to ask it a similar from than this one on your side.

**Nicolas Berrogorry | 55:18**
So maybe. Maybe you can try to ask a similar promp than this one on your side.

**Reuben | 55:28**
Wait. So I think if the instructions that we gave it are correct, then it should be able to handle the VCUC problem.

**Wesley Donaldson | 55:29**
So I think if the instructions that we gave it are correct, then it should be able to handle the V QC problem. 
Okay, I wishes me to be able to send it like a secret.

**Nicolas Berrogorry | 55:42**
But weish just me to be able to send it like a secret is.

**Wesley Donaldson | 55:48**
Yes, one second.

**Nicolas Berrogorry | 55:54**
One second. This.

**Wesley Donaldson | 55:55**
This.

**Nicolas Berrogorry | 55:55**
I'm trying to understand something.

**Wesley Donaldson | 55:55**
I'm trying to understand something.

**Nicolas Berrogorry | 55:58**
We created this secret and it has these two parameters, and we didn't specify any expected output because I still don't understand what the expected output would be.

**Wesley Donaldson | 55:58**
We created this secret, and it has these two parameters. Who can we specify the expected output? 
Because I still don't understand what the expected outlook will be.

**Nicolas Berrogorry | 56:09**
As you mentioned, it will be like a we carry out all of the output parameters, so we are not measuring a single one.

**Wesley Donaldson | 56:09**
As you mentioned, it will be, like a we care of quality of the parameters. So we're not measuring a single one right now.

**Nicolas Berrogorry | 56:21**
Right now. This is doing C was measure ued.

**Wesley Donaldson | 56:23**
This is doing C was measure Q.

**Nicolas Berrogorry | 56:26**
And what I can see is that all that I've done so far for the, retrieval of the memory of this measurement C who has been bit by bit.

**Wesley Donaldson | 56:26**
And what I can see is that all that I've done so far for the retrieval of the memory of this measurement. See who has been g by this I think I would like this I like this.

**Nicolas Berrogorry | 56:38**
I think I like this. I like this. 
So there we may have some compatibility with this type of program, some compatibility issue I would have to look into.

**Wesley Donaldson | 56:49**
So and there we may have some compatibility with this type of product some I have to go into but after a that it's sent to the wire producer and the wire producer creates peace.

**Nicolas Berrogorry | 56:58**
But after that, it's sent to the audience producer and the audience producer creates this.

**Reuben | 57:04**
Yes.

**Wesley Donaldson | 57:04**
Yes.

**Reuben | 57:05**
So.

**Wesley Donaldson | 57:05**
So.

**Reuben | 57:06**
So you're going to have to modify your, definition of quality to do the V VQ, the Q AA take a look at that tutorial.

**Wesley Donaldson | 57:06**
So you're going to have to modify your definition of quality to do the V the QA. Take a look at that tutorial.

**Reuben | 57:21**
So what they are describing is the max CP problem.

**Wesley Donaldson | 57:21**
Yes, what they are describing is the max cut problem.

**Reuben | 57:26**
So the quality that you get is going to be that right there.

**Wesley Donaldson | 57:26**
So the quality that you get is going to be that right there.

**Reuben | 57:34**
Does it successfully minimize F of X?

**Wesley Donaldson | 57:34**
Does it successfully minimize FX?

**Reuben | 57:40**
So you're not just concerned about a single cubit, you're concerned about minimizing F of X.

**Wesley Donaldson | 57:40**
So you're not just concerned about a single humanit, you're concerned about minimizing ep.

**Nicolas Berrogorry | 57:47**
Okay, let me.

**Wesley Donaldson | 57:47**
Okay, let me I think I understand let me phrase it from the side of the pipeline.

**Nicolas Berrogorry | 57:50**
I think I understand. Let me phrase it from the side of the. Of the pipeline. So if we want the pipeline or not the pipeline, but the MCP or like the actual the different workers that we have.

**Wesley Donaldson | 57:56**
So if you will want the pipeline or not the pipeline, but the m CCA or like the actual the different workers that we have here.

**Nicolas Berrogorry | 58:05**
Yes. 
If we wanted to fully understand this problem, for example, it should be able to, from a user prompt, define the graph and be able to maybe run it classically to minimize it classically to know what the expected output should be.

**Wesley Donaldson | 58:08**
If we wanted to fully understand this problem. For example, you should be able to, from a user pro find the graph and be able to maybe run it classical B2 minimize class B2 know what the expected output should be.

**Nicolas Berrogorry | 58:36**
No. No.

**Wesley Donaldson | 58:37**
Again, okay, that's my question.

**Reuben | 58:38**
That's my question, not quite.

**Wesley Donaldson | 58:39**
Mat that.

**Reuben | 58:40**
Okay, so that function men, so F of X, that's your objective function.

**Wesley Donaldson | 58:40**
Okay, so that function in so FX, that's your objective function.

**Reuben | 58:49**
You can evaluate the objective function classically.

**Wesley Donaldson | 58:49**
You can evaluate the objective function classically.

**Reuben | 58:56**
And the quality of the solution is going to depend on how small you get F of X.

**Wesley Donaldson | 58:56**
And the quality of the solution is going to depend on how small you get epigrams.

**Reuben | 59:07**
So and this is kind of typical.

**Wesley Donaldson | 59:07**
So. And this is kind of typical.

**Reuben | 59:09**
And this is unfortunate because this makes your work a lot more complicated here.

**Wesley Donaldson | 59:09**
And this is unfortunate because this makes your work a lot more complicated.

**Reuben | 59:15**
You're not just trying to optimize on a single the output of a single cubot.

**Wesley Donaldson | 59:15**
You're not just trying to optimize on a single the outp of a single cube you.

**Reuben | 59:22**
You. 
So the quality of the results is going to depend entirely on the problem that you're solving.

**Wesley Donaldson | 59:23**
So the quality of the results is going to depend entirely on the problem that you're solving.

**Reuben | 59:30**
And that could be anything.

**Wesley Donaldson | 59:30**
And that could be anything.

**Reuben | 59:34**
So in this case, it's a max cut, but the Q AA solve other problems.

**Wesley Donaldson | 59:34**
So in this case, it's a match cut, but the QA AA can solve other problems.

**Nicolas Berrogorry | 59:44**
So what I found today, because I did face this limitation earlier, is that there are different.

**Wesley Donaldson | 59:44**
So what I found today, because I did face this limitation earlier, is that there are different.

**Nicolas Berrogorry | 59:55**
There are different.

**Wesley Donaldson | 59:55**
There are different.

**Nicolas Berrogorry | 59:57**
Yeah, I go down this route, but I have something else to talk about, but, basically the there are different classes, like in the taxonomy of problems.

**Wesley Donaldson | 59:57**
Yeah, I go down route, but I have something else to talk about. But basically the there are different classes like in the taxonomy of problems.

**Nicolas Berrogorry | 01:00:08**
What Claude explained to me is that we have the classically verifiable.

**Wesley Donaldson | 01:00:08**
What CE explained to me is that we have the classically verifiable.

**Nicolas Berrogorry | 01:00:14**
So basically we can check the output directly.

**Wesley Donaldson | 01:00:14**
So basically we can check the output directly in case of shore for compensation, we can just check if all of the outputs that multiply that for the same input in case of, classically computable.

**Nicolas Berrogorry | 01:00:18**
In case of Shore. For factorization, we can just check if all of the outputs like multiply that produce the same input. In case of, classically computable e it seems like there are strategies to check.

**Wesley Donaldson | 01:00:36**
It seems like there are strategies to check for classical sold a reference.

**Nicolas Berrogorry | 01:00:39**
So classical sol as referenced and that's why I mentioned that like are we able to is there a way to like get the expected values.

**Wesley Donaldson | 01:00:41**
And that's why I mentioned that like are we able to is there a way to like get the expected values so we can compare them with the Ponzon values?

**Nicolas Berrogorry | 01:00:49**
So we can compare them with the quantum values. And then we have some other types of problems that are large VQS and quantum simulation that apparently we don't have an oracle to refer to, but only about self consistency and conversions.

**Wesley Donaldson | 01:00:53**
And then we have some other types of problems that are largely. 
And quantum simulation because apparently we don't have an article to refer to, but only about self consistency and conversions.

**Nicolas Berrogorry | 01:01:09**
So right now I do have like sort of like a.

**Wesley Donaldson | 01:01:09**
So right now I do have that sort of like a.

**Nicolas Berrogorry | 01:01:15**
Because it's not complex enough.

**Wesley Donaldson | 01:01:16**
Because it's not complex enough.

**Nicolas Berrogorry | 01:01:17**
But this case is sort of covered.

**Wesley Donaldson | 01:01:17**
But this case is sort of covert.

**Nicolas Berrogorry | 01:01:21**
Or more easily coverable.

**Wesley Donaldson | 01:01:21**
Or more easily. Coral.

**Nicolas Berrogorry | 01:01:24**
These ones are a complexity because we either had to find a way to ask for the user to input the expected value for the run to EO 2 benchmark, or we should add some sort of Python execution node that can execute the classical version of the algorithm.

**Wesley Donaldson | 01:01:24**
These ones are our complexity because we either have to find a way to ask for the user to input the expected value for the run to goo to benchmark, or we should have some sort of Python execution node that can execute the classical version of the algorithm.

**Nicolas Berrogorry | 01:01:45**
That someone paste in that is doable.

**Wesley Donaldson | 01:01:46**
Someone based in that is twoable.

**Nicolas Berrogorry | 01:01:49**
I know.

**Wesley Donaldson | 01:01:49**
I know.

**Nicolas Berrogorry | 01:01:49**
That's done in.

**Wesley Donaldson | 01:01:49**
That's done in AI, our mental research.

**Nicolas Berrogorry | 01:01:52**
EA IA mental research. So basically you run your class colors and you extract the expected values and then you have something to measure.

**Wesley Donaldson | 01:01:57**
So basically you run your chat cells and you extract the expected values and then you have something to measure but this one I don't have to yet what this means so practically intractible.

**Nicolas Berrogorry | 01:02:07**
But this one, I don't have a clue yet what this means.

**Reuben | 01:02:12**
So basically intractable.

**Nicolas Berrogorry | 01:02:17**
I'm trying to soon.

**Wesley Donaldson | 01:02:17**
I'm trying to soon so I'm trying to.

**Nicolas Berrogorry | 01:02:18**
Sorry, I'm trying to soon I'm getting back again.

**Wesley Donaldson | 01:02:20**
I'm about for.

**Reuben | 01:02:24**
Okay, so a large VQ E.

**Wesley Donaldson | 01:02:24**
Okay, so a large.

**Reuben | 01:02:30**
So what we're doing there is we are trying to find the eigenvalues of a.

**Wesley Donaldson | 01:02:30**
So what we're doing there is we are trying to find the argument values of a.

**Reuben | 01:02:39**
Yeah, I don't see anything that you could do with a quantum simulation.

**Wesley Donaldson | 01:02:39**
Yes, I don't see anything that you could do with a quantum simulation.

**Reuben | 01:02:45**
I don't know how to verify that.

**Wesley Donaldson | 01:02:45**
And they'll go ahead to verify that.

**Reuben | 01:02:46**
Classically, I suggest you don't try to do this problem right now, but look at the classically, verifiable.

**Wesley Donaldson | 01:02:46**
Classically, I suggest you don't try to do this problem right now, but look at the classic.

**Nicolas Berrogorry | 01:03:00**
Okay, so we begin with a C1s and then we try to build up to PUa.

**Wesley Donaldson | 01:03:00**
Okay, so we begin with the easy ones and then we try to build up to EUA I don't know, simulate.

**Nicolas Berrogorry | 01:03:11**
I don't know. Simulate. Waterlecule in an electric field?

**Wesley Donaldson | 01:03:14**
Water. Morecu. In a de.

**Nicolas Berrogorry | 01:03:16**
I don't know if that's something that can be done.

**Wesley Donaldson | 01:03:17**
I don't know if that's something that can be done.

**Nicolas Berrogorry | 01:03:20**
QAA so we should ca can we take that as direction like, first, try to work a little bit more understand that if we can do Shore and Grover.

**Wesley Donaldson | 01:03:20**
Here. A so we should kind we take that as a direction. 
Like I first try to work a little bit more. Understand that if we can do short and stronger. Yeah, do sure.

**Reuben | 01:03:35**
Yeah, do Shore and Grover.

**Wesley Donaldson | 01:03:36**
And ber I recommend that you do short drover.

**Reuben | 01:03:37**
I recommend that you do Shore and Grover. I recommend that you do a simple VCU C, and I'm hoping that there is an example of that in the notebook.

**Wesley Donaldson | 01:03:39**
I recommend that you do a simple DQ C and I'm hoping that there's an example of that in the notebook.

**Reuben | 01:03:47**
If there's not, then you could get it from the Kiskit tutorials.

**Wesley Donaldson | 01:03:47**
If there's not, then you can get it from the tiific tutorials.

**Nicolas Berrogorry | 01:03:52**
Okay.

**Wesley Donaldson | 01:03:52**
Okay?

**Reuben | 01:03:58**
And but the point is, these are algorithms where the verification of the correctness can be done by a classical computation.

**Wesley Donaldson | 01:03:59**
And but the point is, these are algorithms where the verification of the correctness can be done by classical computation.

**Reuben | 01:04:10**
I mean, so Schor's algorithm that factors, composite numbers grovers that does a search, so it's kind of a cool idea.

**Wesley Donaldson | 01:04:10**
I mean so short algorithm that factors composite numbers grovers that does a search. 
So it's kind of a cool idea.

**Reuben | 01:04:26**
Do you know about Grover's algorithm?

**Wesley Donaldson | 01:04:27**
Do you know progress?

**Nicolas Berrogorry | 01:04:30**
Not yet.

**Wesley Donaldson | 01:04:30**
Not yet.

**Nicolas Berrogorry | 01:04:31**
I've only seen, like, how I would I explor, how to how I would test.

**Wesley Donaldson | 01:04:31**
I've only seen, like, how I would. How I would de short.

**Nicolas Berrogorry | 01:04:35**
Sure, but now.

**Wesley Donaldson | 01:04:35**
But I'll explain it to you.

**Nicolas Berrogorry | 01:04:36**
Yeah.

**Reuben | 01:04:37**
I'll explain it to you. So suppose you have a an, array of, say, a million items.

**Wesley Donaldson | 01:04:38**
So suppose you have a an array of, say, a million items.

**Reuben | 01:04:50**
All of them are zero, except for one of them, which is 1.

**Wesley Donaldson | 01:04:50**
All of them are zero, except for one of them, which is one.

**Reuben | 01:04:56**
Grover's algorithm will find the one which is non zero.

**Wesley Donaldson | 01:04:56**
Grower's algorithm will find the one which is non zero.

**Reuben | 01:05:01**
So classically, the only way that you can do this is a brute force search.

**Wesley Donaldson | 01:05:01**
So classically, the only way that you can do this is a brute force search.

**Reuben | 01:05:05**
You just have to check every single entry.

**Wesley Donaldson | 01:05:05**
You just have to check every single entry. Glob overer algorithm can do it faster.

**Reuben | 01:05:10**
Grover's algorithm can do it faster, so it's a quadratic improvement in speed.

**Wesley Donaldson | 01:05:15**
So it's a quadratic improvement in it's a way of finding the legal inmate.

**Reuben | 01:05:22**
It's a way of finding the needle in the haystack.

**Nicolas Berrogorry | 01:05:26**
And do you have to like does it got out of curiosity like that?

**Wesley Donaldson | 01:05:26**
And do you have to like does it out of curiosity, like does it have to have the classical information in it?

**Nicolas Berrogorry | 01:05:31**
Does it have to have the classical information in it? Like does it need like all the Qits that are zero with the same rotation and then one that has a separate rotation?

**Wesley Donaldson | 01:05:38**
Does it mean like all the IDS that are co with the same rotation and then one that has a separate rotation?

**Reuben | 01:05:47**
Yep, yeah, that's it.

**Wesley Donaldson | 01:05:47**
Yeah, that's it.

**Reuben | 01:05:48**
So you build an oracle?

**Wesley Donaldson | 01:05:48**
So you build it, work.

**Reuben | 01:05:52**
Look at the tutorial.

**Wesley Donaldson | 01:05:52**
Look at this before.

**Reuben | 01:05:54**
Yeah.

**Wesley Donaldson | 01:05:54**
Yes, obviously, this is, in a way, the simplest problem that you could imagine.

**Reuben | 01:05:56**
Honestly, this is, in a way, it's the simplest problem that you can imagine. You're trying to find a needle in a haystack, and first you have to be able to define what the haystack is.

**Wesley Donaldson | 01:06:00**
You're trying to find a needle in a haystack, and first you have to be able to define what the haystack is.

**Reuben | 01:06:08**
But yeah, look at the tutorial.

**Wesley Donaldson | 01:06:08**
But you look at the tutorial, it will tell you, okay, I will look at that.

**Reuben | 01:06:09**
It'll tell you.

**Nicolas Berrogorry | 01:06:11**
Okay, I will look at that. It does give me like a follow up question maybe before we can consider wrapping up if you want or move somewhere else.

**Wesley Donaldson | 01:06:12**
It does give me like a follow up question maybe before we can consider wrapping up if you want or move somewhere else.

**Nicolas Berrogorry | 01:06:21**
But.

**Wesley Donaldson | 01:06:21**
But so this does this exploration we just did give you or help you define what the utility for a researcher would be like or insight on how far we are from that does this make sense to continue experi on this route, et cetera?

**Nicolas Berrogorry | 01:06:23**
So this does this exploration we just did give you or help you define what the utility for a researcher will be like or insight on how far we are from that. Does this make sense to continue exploring down this route, et cetera?

**Reuben | 01:06:47**
Well, we have an actual researcher involved here, and that's Florian, so we will be able to answer the question after he sees the results and says, yes, that's cool.

**Wesley Donaldson | 01:06:47**
Well, we have an actual researcher involved here in the explor, so we will be able to answer the question after he sees the results and says yes, that's cool.

**Reuben | 01:06:59**
It helps a lot.

**Wesley Donaldson | 01:06:59**
It helps a lot.

**Nicolas Berrogorry | 01:07:03**
So we continue trying.

**Wesley Donaldson | 01:07:04**
So we continue trying.

**Nicolas Berrogorry | 01:07:05**
Yes.

**Reuben | 01:07:07**
Good.

**Wesley Donaldson | 01:07:07**
Good. 
I'm more square than round. But. Yes, I'm here. That was corny. What's that?

**Nicolas Berrogorry | 01:07:25**
No, I don't know if you want to, because I think we just need a huge, like chunk of work.

**Wesley Donaldson | 01:07:25**
No, I don't know if you want to. No, because I think we just did a absolutely. I think we need to take a moment to just kind of distill that down and figure out like I think the idea of prove QM works, prove our implementation. This is how we get there. Full transparency. 
So I think let's take what we have, let's distill it down, let's kind of create some action items for it, and then we can get back to you guys of like, hey, where are we relative to making updates to the existing system to reflect this? Or like we did an activity, Ruben, where we kind of broke down. Here's what's Jeff's outline is Jeff is the wrong term. The outline Jeff provided based on Ruben and Florians input. 
So taking that, we did a distillization of where we were relative to that. This just further improves that. In my mind, we need to kind of distill that and bring it back to the team and say here's where here, where the gaps are. 
And then we need to have an activity of figuring out what gaps need to be addressed for us. As I said before, to consider this, we have walked up to the line to make a determination on a larger team or even moving it to an implementation team. 
It's a lot of words to say I think we're good here. There's a lot to chew off.

**Reuben | 01:08:45**
You got your friends tell me when you need something more he.

**Wesley Donaldson | 01:08:47**
Excellent. Yeah, I'd love to. Just because, like, I know you guys have a lot of stuff on your plate. I'd love to maybe just tentatively put something on calendar for us to give us something to March towards. Full transparency. Are you comfortable with this lot next week?

**Reuben | 01:09:07**
Letmi check.

**Wesley Donaldson | 01:09:08**
Check.

**Reuben | 01:09:17**
Next weekphia no.

**Wesley Donaldson | 01:09:17**
Thank week. 
Yeah, you don't have to do it right now, just if you can give me a couple of slots, we'll make. We'll find a Slack for you that you could do.

**Reuben | 01:09:32**
Yeah, goodness, I mean no.

**Wesley Donaldson | 01:09:35**
Goodness.

**Reuben | 01:09:37**
I evidently am going to spend the rest of my life in meetings back to back.

**Wesley Donaldson | 01:09:37**
I am going to spend the rest of my life in meetings back to back.

**Reuben | 01:09:43**
Let me get back to you. Okay.

**Wesley Donaldson | 01:09:45**
We can. We can chat over Slack. I'm trying to get Jeff to give me an account. 
So that way I don't have to bother you with this in the future. I could just propose something to you again.

**Reuben | 01:09:53**
That makes a lot of sense.

**Wesley Donaldson | 01:09:56**
Thank you.

**Reuben | 01:09:56**
Wait, hold on, wa Dominick, you're in Europe.

**Wesley Donaldson | 01:09:57**
Ye know, if you're in Europe in Poland actually, so we okay, so that makes it awkward now it's 07:00 pm that you are so dedicated.

**Nicolas Berrogorry | 01:10:04**
Yep.

**Speaker 4 | 01:10:05**
In Poland, actually.

**Reuben | 01:10:06**
Yep, so it's late for you. Okay, so that makes it awkward and now.

**Speaker 4 | 01:10:11**
It's seven PM twelve.

**Reuben | 01:10:13**
After. Yeah, well, I'm glad that you are so dedicated. Thank you for spending the time with us.

**Wesley Donaldson | 01:10:16**
Thank you for spending the time with us.

**Reuben | 01:10:18**
Sure, but yeah, so the time zones are going to make things awkward a little bit.

**Wesley Donaldson | 01:10:18**
Sure, but yes, so the times out are going to make things awkward a little bit.

**Reuben | 01:10:25**
We could arrange something like.

**Wesley Donaldson | 01:10:25**
We could arrange something.

**Reuben | 01:10:27**
Afternoons are almost always free for me though.

**Wesley Donaldson | 01:10:27**
Afternoons are almost always free for me. 
Yeah, so that you couldn't make it.

**Reuben | 01:10:30**
So Dominic, you couldn't make it. But Nico, you're.

**Wesley Donaldson | 01:10:32**
But Nico, you're where you I mean u wi basically CMT -3 got it.

**Reuben | 01:10:36**
Where are you?

**Nicolas Berrogorry | 01:10:37**
Im mean Euri it's basically cmt -3.

**Reuben | 01:10:41**
Got it. So that would be well that would be relatively convenient it'd be not too bad for you.

**Wesley Donaldson | 01:10:42**
So that would be relatively convenient. It be not too bad, I think. Like, let me connect with Dominic and Nicholas on this. 
Like, I if that afternoon is the best thing for you. I want them to be a part of these conversations. But, like, if it's the only time you have. Like maybe ones like finding a compromise between the two. Let's communicate over Slack, Robin, we'll find a time, okay?

**Nicolas Berrogorry | 01:11:12**
Okay.

**Wesley Donaldson | 01:11:13**
Right, thanks, guys.

**Reuben | 01:11:15**
Thank you. See all later by.

