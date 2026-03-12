# Qbridg - MCP Core  - Mar, 12

# Transcript
**Speaker 2 | 00:02**
Exactly the same process.

**Wesley Donaldson | 00:02**
Exactly the same process.

**Speaker 2 | 00:03**
So we use the quas circuit, we go to those four layers for functions.

**Wesley Donaldson | 00:03**
So we use the quas circuit and we go through those four layers for functions. We prefer those seven-number vectors and use those vectors to find the most similar in the database.

**Speaker 2 | 00:12**
We prepare those 70-number vectors and use those vectors to find the most similar in the database. So that's the idea of the solution for the QMM circuit system, let's say, yeah.

**Wesley Donaldson | 00:20**
So that's the idea of the solution for the QMM circuit system, let's say, yeah.

**Speaker 2 | 00:32**
So actually that's what we researched, what we found, and what could be done.

**Wesley Donaldson | 00:32**
So actually that would be what we researched, what we found, and what we will do.

**Speaker 2 | 00:39**
I'm not sure if it's go to be working, if it's going to be enough, but it's something that we found and I think that the entire Solviet team wants to try this out and just check if it works or if it's the thing that we should go further with.

**Wesley Donaldson | 00:39**
I'm not sure if it's going to be working, it's going to be enough, but it's something that we found and I think that the entire Resolvi team wants to try this out and just check if it works or if it is a thing that we should go for.

**Speaker 2 | 00:56**
So yeah.

**Wesley Donaldson | 00:56**
Yeah, we have potentially cutting... Probably the one concern I would have is a reliance on something that may actually detract from the discovery of some option that's required that hasn't been previously considered or anything.

**Jeff | 00:57**
That's it. Yeah, potentially. I mean, probably the one concern I would have is any reliance on something that may actually detract from the discovery of some option that's required that hasn't been previously considered or anything. I just want to make sure it's... I don't know. This is fairly complicated where this might be injected, so what effect it has is really interesting to me, that's all.

**Wesley Donaldson | 01:18**
Just want to make sure it's... I don't know. It is fairly complicated where this might be injected.
So what effect it has is really interesting, that's all.

**Sam Hatoum | 01:33**
Another way to look at it, I think, is... Yeah, I'll just say this on... I'll give you the mic. I think another way to look at this is a kind of a search, really, where we're storing things as we go along.

**Wesley Donaldson | 01:39**
I think another way to look at this is a kind of a search, really, where we're storing things as we go along.

**Sam Hatoum | 01:44**
So we're indexing, and then on the other way out, we're searching.

**Wesley Donaldson | 01:44**
So we're indexing, and then on the other way out, we're searching.

**Sam Hatoum | 01:48**
And so, you know, how well can we index and how well can we find and ultimately rehydrate memory context to do something?

**Wesley Donaldson | 01:48**
So how well can we index, and how well can we find, and maybe hydrate memory in my context to do something, especially how to look at this.

**Sam Hatoum | 01:57**
So that's really how to look at this.

**Wesley Donaldson | 01:58**
Yeah, that's another movie part with some variants within it, so it can... It's not as deterministic as something like a real normal index, let's say.

**Sam Hatoum | 01:58**
And yeah, definitely it's another moving part with some variant within it, so it can, you know, it's not as deterministic as something like a real a normal index, let's say. So yeah, there's it's very interesting, but we thought we'd put it on the table and see, you know, how far do we want to explore this further, should we park it, should we continue down it that's the next decision point.

**Wesley Donaldson | 02:11**
So yeah, there's this is very interesting, but we all throw it on the table and see how far do we want to explore this further to pocket we can compete on it.
That's the next decision point.

**Sam Hatoum | 02:28**
W sorry.
Nikko or Jeff.

**Speaker 5 | 02:35**
Okay. Yeah, so that I think that is a that was a really good explanation on your side.

**Wesley Donaldson | 02:37**
Yeah. So I think that is that was a really good expansion on your side to can I share my experiences?

**Speaker 5 | 02:44**
Can I share my screen, please?

**Jeff | 02:45**
Yeah, sure, thank you.

**Wesley Donaldson | 02:45**
Sure. You should be seeing a page on Confluence.

**Speaker 5 | 02:52**
You should be seeing a page on Confluence is already able to see.

**Wesley Donaldson | 02:58**
Yeah. Okay, so all that bit here basically is trying to address the fingerprinting and retrieval of priors.

**Speaker 5 | 02:58**
Okay, so all that done just shared basically is trying to address the fingerprinting and retrieval of priors. QM priors.

**Wesley Donaldson | 03:10**
QM priors.

**Speaker 5 | 03:11**
So in that context, the idea was, okay, if we create a fixed fingerprint that represents each exact sequence, it's the same as, for example, trying to do RAG or any type of database.

**Wesley Donaldson | 03:11**
So in that context, the idea was... Okay, if we create a fixed fingerprint that represents each exact sequence, it is the same as, for example, trying to do a RAG or any type of database.

**Speaker 5 | 03:24**
For example, on a... Let's think about the easiest possible way to do this, which will be simply getting a SHA256 hash of the actual sequence secret that will provide exact matches, but it will not find similarity.

**Wesley Donaldson | 03:24**
For example, on... Let's think about this as a possible way to do it. Which will be simply getting a shower hash of the actual QS and circuit that will provide exact matches, but it will not find similarity matches and basically cross-pollinating with the other aspects of the system which will be SC with the evaluation for us to be able to search those similar QM priors.

**Speaker 5 | 03:40**
Matches and basically cross-pollinating with the other aspects of the system, which will be a secret evaluation for us to be able to search those similar QM priors. What we found is that we need to do some sort of similarity, so the fingerprint should be about a category of circuit, a type of circuit, and not necessarily about the exact circuit.

**Wesley Donaldson | 03:56**
What we found is that we need to do some sort of similarity.
So the fingerprint should be about a category of circuit, a type of circuit, and not necessarily about the exact circuit.

**Speaker 5 | 04:07**
Basically, what I did last week was to try to find what are the different strategies that we can use from existing research to try to bridge that gap from a rag implementation of a database and the actual requirements that...

**Wesley Donaldson | 04:07**
Basically, what I did last week was to try to find what are the different strategies that we can use from existing research to try to be that CP from a rag implementation of a database and the actual requirements that...

**Speaker 5 | 04:27**
Well, so far, Chef, and will be provided by these new people that you mentioned.

**Wesley Donaldson | 04:28**
So far, Chef, and will be provided by these new people that you mentioned. So basically, how do we do that together?

**Speaker 5 | 04:34**
So basically, how do we glue that together?

**Wesley Donaldson | 04:36**
So this stuff is already present in the document that you shared with us, Chef, on the specs and some of that maybe something that is worth exploring and adding to it.

**Speaker 5 | 04:37**
Some of the stuff is already present in the document that you shared with us, Chef, on the specs. Some of that maybe something that is worth exploring and adding to it.
But basically, the most primordial elements are the things that appear on your document, which are like a secret count connectivity and gate types and all that.

**Wesley Donaldson | 04:49**
But basically, the most primordial elements are the things that appear on your document, which are like a ST count connectivity and gate types and all that. But what happens if different gates represent the same concept in a ST?

**Speaker 5 | 05:01**
But what happens if different gates represent the same concept in a circuit? Then what you try to do is to find some more or less abstract ways of fingerprinting your sequence.

**Wesley Donaldson | 05:06**
Then what you try to do is to find some other more abstract ways of inpting your secrets.

**Speaker 5 | 05:14**
And there are many different strategies.

**Wesley Donaldson | 05:14**
And there are many different strategies.

**Speaker 5 | 05:16**
You can use...

**Wesley Donaldson | 05:16**
You can use... A direct graph you can use... You can even use it in canonical forms you can use this Wist failure LLaMA Graph Hashing. All this is basically let's get a graph. Let's try for at different levels. Provide a description of what the graph looks like.

**Speaker 5 | 05:17**
Directed graphs you can use... In canonical forms you can use this Wist failure LLaMA Graph Hashing. All this is basically let's get a graph. Let's try for at different levels. Provide a description of what the graph looks like.
So what I mean at different levels is like simplifying the graph to different extents and providing all of these different layers of abstraction of the GE graph which will be your circuit and include each layer of the...

**Wesley Donaldson | 05:36**
So what I mean at different levels is like simplifying the graph to different extents, providing all of these different layers of abstraction of the GE graph which will be your circuit and include each layer of the... On the electoral search, different types of search strategies to Iraq, then the different types of ways of finding which graphs are the same, and all of these strategies can be used together.

**Speaker 5 | 05:52**
Different types of search strategies could Iraq, then different types of ways of finding which graphs are the same, and all of these strategies can be used together.
I provided in the docs forward slash dogs in the report like a first draft of what the embedding extraction for a secret will be like.

**Wesley Donaldson | 06:06**
I provided in docs forward slash dogs in the report like a first draft of what the embedding extraction for will be like.

**Speaker 5 | 06:18**
So first we get this hash generic cash that represents a type of ST from a sequence.

**Wesley Donaldson | 06:18**
So first we get this hash generic cash that represents a title of squid from a squid.

**Speaker 5 | 06:23**
If you give it this algorithm two different sets that actually are the same type of circuit, maybe expressed in a different way, they should give the same hash.

**Wesley Donaldson | 06:23**
If you give it as two different squids that actually are the same type of suit with maybe expressed a different way, they should give the same ch and that's where right comes in.

**Speaker 5 | 06:34**
And that's where RAG comes in.

**Wesley Donaldson | 06:36**
It will help us user made to find a similar sequence and therefore extract the Q prior from that.

**Speaker 5 | 06:36**
It will help us use that embedding to find the similar sequences and therefore extract the QMM priors from that the.

**Wesley Donaldson | 06:44**
The to answer to your last question, Shawater, the implications of these.

**Speaker 5 | 06:45**
To answer your last question, Chef, what are the implications of this?

**Wesley Donaldson | 06:49**
Well, in my view, what this can help is to help any other land or other type of models that we use to... So when once we have a specific SE, we can know in which category it fits.

**Speaker 5 | 06:49**
Well, in my view, what this can help with is to help any LM or other type of model that we use to... So once we have a specific circuit, we can know in which category it fits. If there are no answers that aren't there in research, it might find it by generalizing.

**Wesley Donaldson | 07:03**
And if there are like no other answers that there are there is in research that it might find it by sen.

**Speaker 5 | 07:12**
That's a capability that LLM has shown, and all types of models like ChatGPT and all of that have already shown that they can share it.

**Wesley Donaldson | 07:12**
That's a couple of evidence that have shown. All types of models like that have already shown that data sharing is possible. So I do think that this is viable.

**Speaker 5 | 07:19**
So I do think that this is viable. In my opinion.

**Wesley Donaldson | 07:22**
In my opinion. All this document will explain how we can extract different types of layers, create one vector that represents a set, and we can use that for RAG and how they first prospect for that.

**Speaker 5 | 07:23**
All this document will explain how we can extract different types of layers, create one vector that represents a set, and we can use that for RAG and have a first prototype for that.
So yeah, the work has been mainly about trying to look for alignment with your documents, trying to look at how we would actually go to implement and how we could blue like the engineering side with the research.

**Wesley Donaldson | 07:38**
So yeah, the work has been mainly trying to look for alignment with your documents, trying to look at how we will actually go to implement and how we could... Blue like the engineering side with the research.

**Speaker 5 | 07:53**
So I think that it's great that you're bringing in more people to represent the research side.

**Wesley Donaldson | 07:53**
So I think that it's great that you're reading more people to represent the research side.

**Speaker 5 | 07:59**
This output that I'm going to show here is basically how everything maps regarding to your documents.

**Wesley Donaldson | 07:59**
This output that I'm going to show here is basically how everything matters regarding to your documents that maybe it's a little bit...

**Speaker 5 | 08:08**
Let me maybe in a little bit.
So here we have a couple of points.

**Wesley Donaldson | 08:11**
So here we have a couple of points.

**Speaker 5 | 08:16**
So a stable structural fingerprint.

**Wesley Donaldson | 08:16**
So a stable structural fingerprint. This is what I'm talking about.

**Speaker 5 | 08:18**
This is what I'm talking about. We have a prior lookup.

**Wesley Donaldson | 08:19**
We have human prior lookout.

**Speaker 5 | 08:21**
I will mention this connectivity to policy extraction.

**Wesley Donaldson | 08:21**
I mentioned this connectivity to the policy structure.

**Speaker 5 | 08:25**
This part is going to be included possibly in the structural fingerprint itself, as I mentioned, so we can find similar sequences.

**Wesley Donaldson | 08:25**
This part is going to be included possibly in the structural fingerprint itself, as I mentioned, so we can find similar segments, not only exact priors.

**Speaker 5 | 08:34**
Not only exact priors.
Yeah, there are some other aspects, like phrase orion identification, how it doesn't do that short repetition structure assessment... It's just not covered.

**Wesley Donaldson | 08:37**
Yeah, there are some effects like phrase unification, how it doesn't do that repetition structure assessment core by east.

**Speaker 5 | 08:46**
But it is... It's just not covered by this area and the parameter sensitivity.

**Wesley Donaldson | 08:46**
It's not over by this area and the parameter sensitivity. This one, as I mentioned, is fresh... Parameter sensitivity is some work that we still have to do.

**Speaker 5 | 08:52**
This one, as I mentioned, is fresh ariation and parameter sensitivity is some work that we still have to do.
But yeah, that's sort of like a progress report on understanding side and mapping with your document.

**Wesley Donaldson | 08:59**
But yeah, that's sort of the progress report and understanding side and mapping with your document specifications.

**Speaker 5 | 09:06**
Specifications.

**Jeff | 09:11**
I'll be good.

**Wesley Donaldson | 09:11**
I'm good.

**Jeff | 09:12**
This is, there's progress on that.

**Wesley Donaldson | 09:12**
There's progress, and I appreciate that.

**Jeff | 09:14**
I appreciate that. I think, at this stage though...

**Wesley Donaldson | 09:16**
I think at this stage of.

**Jeff | 09:19**
So we're at this kind of apex where we need to bring in the heavy research considerations for all of this now that we've got this kind of in shape and against what was put down in that original definition.

**Wesley Donaldson | 09:19**
So we're at this kind of apex where we need to bring in the heavy research considerations for all of this. Now we've got this kind of in shape. Guess what was put down in that original definition?
So it'll be really interesting to see how we can schedule that in and how much time that's going to take and what kind of progress we could even think about making.

**Jeff | 09:35**
So it'll be really interesting to see how we can schedule that in and how much time that's going to take, and what kind of progress we could even think about making. That's not necessarily deeply dependent on the inner workings of this concept.

**Wesley Donaldson | 09:46**
That's not necessarily deeply dependent on the inner workings of this concept. I don't want to go too far into this concept without consideration and input from Slack and...

**Jeff | 09:54**
I don't want to go too far into this concept without consideration and input from Slava and...
So, yeah, I mean, we don't want to get stuck in the mud either.

**Wesley Donaldson | 10:03**
So yeah, I mean, we don't get stuck in the mud either. So I'm interested in a couple of things, like mostly continuing to understand any dependencies on scaffolding or integrations or anything like that might be in place or might be set.

**Jeff | 10:08**
So I'm interested in a couple of things, like mostly continuing to understand any dependencies on scaffolding or integrations or anything like that might be in place or might be set. But with respect to how this continues to develop against the original concept, I think we definitely need to get deeply into the feasibility of those guys.

**Wesley Donaldson | 10:22**
But with respect to how this continues to develop against the original concept, I think we definitely need to get deeply into the feasibility of those guys.

**Jeff | 10:37**
So one other thing to consider here, though, that has nothing to do with that is when we get into a larger circuit and a much wider array of variants being processed at the same time.

**Wesley Donaldson | 10:38**
So one other thing to consider, though, that has nothing to do with that is when we're getting to a larger circuit in a much wider array of variants being processed at the same time.

**Jeff | 10:55**
Having a recognition of, you know, what's happening and sort of like capturing the information coming back from those variants as they're being run and seeing how much an L one can understand about that.

**Wesley Donaldson | 10:55**
Having a recognition of, you know, what's happening and sort of like capturing the information coming back from those variants as they're being run and seeing how much in L one can understand about that because I'm really interested in that stage.

**Jeff | 11:12**
Because I'm really interested in that stage, how this might scale with an L one, so to speak, without worrying about what it specifically is doing.

**Wesley Donaldson | 11:16**
How is my skill in L one, so to speak, without worrying about what it specifically is doing?

**Jeff | 11:22**
But more like the stage where we're kicking off, you know, a large number of variants, whether at scale there can be some kind of comprehensive reference made by an LM that makes any sense.

**Wesley Donaldson | 11:22**
But more like the stage where we're kicking off a large number of variants, whether at scale there can be some comprehensive reference made by L one that makes sense. No. That makes any sense.

**Jeff | 11:40**
Just the concept of that.

**Wesley Donaldson | 11:40**
Just the concept of that.

**Jeff | 11:41**
So maybe we can get into that a little bit about just blowing these circuits out so that they're much more complex and that just a bigger circuit doesn't necessarily do it.

**Wesley Donaldson | 11:41**
So maybe we can get into that a little bit about just blowing these circuits out so that they're much more complex and just a bigger circuit doesn't necessarily do it. So I think what I'm going to do is just...

**Jeff | 11:54**
So I think what I'm going to do is just...
Look to...

**Wesley Donaldson | 11:57**
Look to...

**Jeff | 11:58**
Talking to...

**Wesley Donaldson | 11:58**
Talking to...

**Jeff | 11:59**
Look to talk to again, Sasha and Slava, to get an idea of what their ideal test scenarios might be for that.

**Wesley Donaldson | 11:59**
Look to talk to again, Sasha and Slava, to get an idea of what their ideal scenarios might be for that.

**Jeff | 12:08**
But at least we should look into that stage.

**Wesley Donaldson | 12:08**
But at least we should look into that stage we have into that a little bit.

**Speaker 5 | 12:12**
We have looked into that a little bit. Sorry, Sam, I think I talked over you.

**Wesley Donaldson | 12:15**
Sorry, Sam, talk over again.

**Speaker 5 | 12:17**
That's okay, Kri. Okay, so we already looked into that a little bit.

**Wesley Donaldson | 12:20**
Okay. So we already looked into that a little bit.

**Speaker 5 | 12:24**
So basically, of course, we remember like our task was to explore the different types of circuits or more complexity SES types of circuits.

**Wesley Donaldson | 12:24**
So basically, of course, we remember like our task was to explore the different types of SS or more complexity s that type of service.

**Speaker 5 | 12:34**
So another line of research that we took was about secret taxonomy.

**Wesley Donaldson | 12:34**
So another line of research that we did was about secret astronomy.

**Speaker 5 | 12:42**
So I just did like a initial pass trying to let me go this is there trying to sorry.

**Wesley Donaldson | 12:42**
So I just did like a initial pass trying to let me go to I'm going.

**Sam Hatoum | 12:52**
NI I'm gonna say something. So just before you get into that.

**Wesley Donaldson | 12:54**
So you're about to get into the best of it, which is great, but which is awesome.

**Sam Hatoum | 12:54**
So you're about to get into the depth of it, which is great like it's awesome and I'd like you to do it in a second, but, Jeff, just to go higher level.

**Wesley Donaldson | 12:58**
I'm like, "You do a second, but you have to go higher level."

**Sam Hatoum | 13:03**
I think this is just the same as any other expectation acceptance criteria specification problem that we've had in the past.

**Wesley Donaldson | 13:03**
I think this is just the same as any other expectation acceptance criteria specification problem that we've had in the past.

**Sam Hatoum | 13:10**
And I think if we've got a set of scenarios like you said, that, you know, if we can express them as.

**Wesley Donaldson | 13:10**
And I think you we've got a set of scenarios like as you said, that if we can express them as.

**Sam Hatoum | 13:16**
Look, here's an input circuit.

**Wesley Donaldson | 13:16**
Look, here's an input circuit.

**Sam Hatoum | 13:19**
Here is the task, here's the expected output.

**Wesley Donaldson | 13:19**
Here's the task. Here's the expected output.

**Sam Hatoum | 13:21**
If we can get some of those from the experts...

**Wesley Donaldson | 13:21**
If we can get some of those from the experts, this is super likely.

**Sam Hatoum | 13:24**
Like, if you know, this is a super. Like here are ten large circuits.

**Wesley Donaldson | 13:25**
Here are ten large circuits.

**Sam Hatoum | 13:28**
When we go to find one by some criteria, then this is the expected output.

**Wesley Donaldson | 13:28**
When we go to find one by some criteria, then this is the expected output.

**Sam Hatoum | 13:33**
If we can get that kind of stuff, then that gives us the opportunity to work at the depths and bring back the right results.

**Wesley Donaldson | 13:33**
If we get that kind of stuff, then that gives us the opportunity to work with it in the tents and bring back the right resources.

**Jeff | 13:41**
Yeah, okay, that makes sense.

**Sam Hatoum | 13:43**
So. Okay, so now you get into the depths of...

**Speaker 5 | 13:46**
Yeah, and basically, like, that's actually it.

**Wesley Donaldson | 13:46**
Yeah, and basically that it does actually it.

**Speaker 5 | 13:51**
What I was going to share, basically, is that from Florence's feedback and from Rinor's feedback from the meeting that we had the other day.

**Wesley Donaldson | 13:51**
What I was going to share basically is that from Rinor's feedback from the meeting that we had the other day.

**Speaker 5 | 14:01**
Basically, I went out to find or do like an initial research that for sure needs to be verified by them.

**Wesley Donaldson | 14:01**
Basically, I went out to find or do an initial research for a service to be verified by them about what the different types of quantum secrets that people may be put in here are.

**Speaker 5 | 14:08**
About what the different types of quantum secrets that people may input in here
are. So we know that we basically can support all of these cases or at least know for this prototype which cases do we want to support?

**Wesley Donaldson | 14:15**
So we know that we basically can support all of these cases or at least know that his brother that which cases do we want to support?

**Speaker 5 | 14:23**
And I found like a very success of ways to distinguish between different types of circuits.

**Wesley Donaldson | 14:23**
And I found like a very success of ways to distinguish between different sys.

**Speaker 5 | 14:31**
I'm not going to go through all five or more axes, but I will go a little bit over the cross-reference matrix.

**Wesley Donaldson | 14:31**
I'm not going to go through five or more axes, but I will go a little bit over the cross-reference matrix.

**Speaker 5 | 14:40**
I made, from all of the different comparison axes, and basically found very distinct types of sequences.

**Wesley Donaldson | 14:40**
I mean, from all of the different comparison axes. And basically, I found that very distinct types of sequences.

**Speaker 5 | 14:51**
The different... I discovered different problems at the time of doing baseline evaluation and doing results evaluation in order for us to be able to compare with the QMM.

**Wesley Donaldson | 14:51**
The different... I discovered different problems at the time of doing baseline evaluation and doing results evaluation in order for us to be able to compare with the QMM and basically the parental sensitivity and spastic compression, we need you to run that data and say, for example, "Hey, yeah, your sequence in your context is doing what it's supposed to be doing."

**Speaker 5 | 15:06**
The parameter sensitivity at the stochastic compression. We need to be able to run that baseline and say, for example, "Hey, yeah, your sequence in your context is doing what it's supposed to be doing." Now let's see what happens when we apply QM and stochastic compression of that to it to be able to compare.

**Wesley Donaldson | 15:21**
Now let's see what happens when we apply QM and stochastic compression of that to it to be able to compare.

**Speaker 5 | 15:27**
So this is related to pace and evaluation as well.

**Wesley Donaldson | 15:27**
So it's really based on evaluation as well.

**Speaker 5 | 15:29**
And I found like these 15 different types of sequences.

**Wesley Donaldson | 15:29**
And I found that these fifteen different thousand secrets.

**Speaker 5 | 15:34**
Then for each one, I basically biped different samples for each one of these.

**Wesley Donaldson | 15:34**
Then for each one, I basically biped different samples for each one of these.

**Speaker 5 | 15:42**
Some of these are taken straight from the IBM tutorials.

**Wesley Donaldson | 15:42**
Some of these are taken straight from the IBM tutorials, for example, there should be a sample of your former.

**Speaker 5 | 15:48**
For example, there should be a QAA sale here somewhere. And I haven't yet run this.

**Wesley Donaldson | 15:53**
And I can't get. Run this. I get.

**Speaker 5 | 15:55**
I could...
But since we don't have any way to evaluate it yet...

**Wesley Donaldson | 15:57**
Since we don't have any way to evaluate it yet, I wouldn't know if it makes sense that when it runs, it is getting the expected results.

**Speaker 5 | 16:00**
I wouldn't know if it's doing what it's supposed to do when it runs. Is it getting the expected results?
That is something that I wanted to bring up. There are some types of SE circuits that are easily verifiable.

**Wesley Donaldson | 16:07**
And that is something that I wanted to bring up is that there are some types of sequence that are easily verifiable.

**Speaker 5 | 16:15**
For example, short circuits you get factoring a number.

**Wesley Donaldson | 16:15**
For example, short circuits you will get characterizing a number.

**Speaker 5 | 16:19**
If you multiply the two outputs and it gives you the original number, you're golden.

**Wesley Donaldson | 16:19**
If you multiply the clouds, it gives you the original number, you're all good.

**Speaker 5 | 16:23**
But there are other types of secrets that are really complex to evaluate, and if we want to support those, we should try to look into how we even process and create a baseline evaluation for those.

**Wesley Donaldson | 16:23**
There are all the types of circuits that are really complex to evaluate, and if we want to support those, we should try to look into how we can process and create a baseline evaluation for those. We agree with you at the time.

**Speaker 5 | 16:37**
What we agreed with ruin at the time and this is up for discussion.

**Wesley Donaldson | 16:40**
This is up for discussion for you decide actually is to go with the s arism first and to the fact that we can is a random circuit.

**Speaker 5 | 16:42**
For you to decide actually is to go with a short algorithm first and to leverage the fact that we can. Is this the random circuit?
Yes, this is the random circuit.

**Wesley Donaldson | 16:53**
Yes, this is the random circuit.

**Speaker 5 | 16:54**
Let me choose an R then.

**Wesley Donaldson | 16:54**
Let me choose an R even.

**Speaker 5 | 16:56**
Yeah, so our circuit input already allows specifying and expected output, right?

**Wesley Donaldson | 16:56**
Yes, so our circuit input already allows specifying and expected output, right?

**Speaker 5 | 17:02**
But in this case, it won't even work.

**Wesley Donaldson | 17:02**
But in this case it won't even work it I hope it won't even work evaluated.

**Speaker 5 | 17:06**
It's very close, but it won't even work for evaluating because when we go to the output of the circuit, here is that expected output of zero, seven, and five.

**Wesley Donaldson | 17:08**
Sure. Because when we go to the output of the circuit, I hear that expected output of zero, $705 last year.

**Speaker 5 | 17:15**
It's this dotted line here. We can see if the results convert to that.

**Wesley Donaldson | 17:17**
And we can see the results convert to that.

**Speaker 5 | 17:20**
But if we run short through here, it will produce the first two results, and none of them will converge to the value.

**Wesley Donaldson | 17:20**
But if we run short here, it will produce the first two results, and none of them will convert to this. But so the problem that arises is we should define or have an announced spec document about evaluating the different types of secrets and the different ways of doing that.

**Speaker 5 | 17:25**
So the problem that I'm raising is we should define or have another spec document about evaluating the different types of secrets and the different ways of doing that.
Yeah, I think before I open up for questions.

**Wesley Donaldson | 17:41**
Yeah, I think before I open up for questions.

**Speaker 5 | 17:45**
Never mind, I crashed.

**Wesley Donaldson | 17:45**
No, my I rushed.

**Speaker 5 | 17:46**
So let's open.

**Wesley Donaldson | 17:46**
So that's open.

**Speaker 5 | 17:47**
That's open for questions or discussion.

**Wesley Donaldson | 17:47**
That's open for questions or discussion. I have a question.

**Brian | 17:55**
I have a question if you... This rag approach, if I understand you correctly, what you're looking to do is cache your previous results and try to get as close as a fuzzy match for the current input against the best results of a prior run.

**Wesley Donaldson | 17:59**
This rag approach, if I understand correctly, what you're looking to do is cache your previous results and try to get as close as a fuzzy match for the current input against the best results of a prior run.

**Brian | 18:13**
Is that accurate?

**Wesley Donaldson | 18:13**
Is that accurate?

**Brian | 18:14**
So far.

**Speaker 5 | 18:15**
Yeah, that's the best way to say it.

**Wesley Donaldson | 18:15**
Yes, that's the basically you say it.

**Brian | 18:18**
Yeah, okay, I wonder that seems like a balld approach to me.

**Wesley Donaldson | 18:18**
Yeah, okay, I wonder that seems like a valid approach to me.

**Brian | 18:24**
I wonder if we should consider.

**Wesley Donaldson | 18:24**
I wonder if we should consider... Are there other approaches that wouldn't facilitate reordering of the gates in the circuit or finding redundancies or something like that?

**Brian | 18:27**
Are there other approaches that wouldn't facilitate reordering of the gates in the circuit or finding redundancies or something like that? Would RAG fail in those scenarios?

**Wesley Donaldson | 18:38**
Would RAG fail in those scenarios?

**Brian | 18:42**
Maybe they're just other equals that we do later on in addition to this one.

**Wesley Donaldson | 18:42**
Maybe there's just another equal that we do later on in addition to this one.

**Speaker 5 | 18:45**
Yeah, that's a great question.

**Wesley Donaldson | 18:45**
Yeah, that's a great question, and that goes back to the beginning of our presentation today.

**Speaker 5 | 18:49**
That goes back to the beginning of our presentation today. Basically, RAG itself is just a database, right?

**Wesley Donaldson | 18:55**
Basically, right itself is just a data, right? It is small non-drug, but like a vector data.

**Speaker 5 | 18:59**
Like it well, not RUG, but like a vector database. Imagine that you have your vectors for pointing in different directions.

**Wesley Donaldson | 19:03**
Imagine that you have a vector going in different directions, you will find similar vectors.

**Speaker 5 | 19:06**
You will find similar vectors.
So the question is what do you put in that vector?

**Wesley Donaldson | 19:09**
So the question is, what do you put in that vector?

**Speaker 5 | 19:12**
I provided a draft of what we could be doing that we should definitely evaluate with the experts in the field.

**Wesley Donaldson | 19:12**
I provided a draft of what we could be doing that we should definitely evaluate with the experts in the field.

**Speaker 5 | 19:21**
But basically, but by choosing the right type of vectors, we can achieve that fast match.

**Wesley Donaldson | 19:21**
But basically by choosing the right type of baker, we can achieve that fast match.
If we were to use like if we were to, let's say naively grab the QSNS and just get some vectors of it.

**Speaker 5 | 19:31**
If we were to use like if we were to, let's say naively grab the Q SM circuit and just get some vectors out of it as if it were text and try to look into that, it will be a completely different phrase a ST that is doing the same, but it's optimized a different way.

**Wesley Donaldson | 19:40**
And if it were best and try to look into that it will be a completely different phrases that is doing the same but is optimized a different way.

**Speaker 5 | 19:49**
For example, it...

**Wesley Donaldson | 19:49**
For example, it will give you a totally different vector.

**Speaker 5 | 19:51**
It will give you a totally different... [Laughter]. Vector. But if we apply some of these mechanisms that basically grab the vector, turn it into a graph or a hypergraph, and then basically create simplified versions of that graph and use each one of those different vectors inside of that embedding, you can actually extract the soul of the circuit, not the secret itself.

**Wesley Donaldson | 19:56**
But if we apply some of these mechanisms that basically grab the vector, put it into a graph or a hypergraph, and then basically create simplified versions of that graph and each one of those different vectors inside of that embedding, you can actually extract the soul of the secret instead of the secret itself.

**Speaker 5 | 20:22**
And that will support finding stuff that has, for example, redundancies, error correction, and different ways of expressing the same circuit like I do see that as a possibility.

**Wesley Donaldson | 20:22**
And that will support finding out that the customer sale redundancies error correction and different ways of expressing the same circuit that I do see as a possibility.

**Speaker 5 | 20:34**
It's one layer on top of a graph to actually extract those embeddings.

**Wesley Donaldson | 20:34**
It's one layer on top of a graph to actually extract those embeddings.

**Speaker 5 | 20:38**
And this is just a draft.

**Wesley Donaldson | 20:38**
And this is just a draft.

**Speaker 5 | 20:40**
I'm not saying that these embeddings that I laid out here will work.

**Wesley Donaldson | 20:40**
I don't think that these embeddings that I laid out here will work. It is probably going to be polished and worked on a lot.

**Speaker 5 | 20:45**
It's probably going to have to be polished and worked on a lot.

**Sam Hatoum | 20:49**
But basically, you take a circuit, you take away the details if you're squinting, and then you look around while squinting, and then you find them, and then you unsquint, and then it gets the actual one, and you hope it's the right one.

**Wesley Donaldson | 20:49**
Basically, you take a circuit, you take away the details that are squinting, and then you look around while it's squinting, and then you find them and then you unsquint and then it gets the actual one and your hope is the right one.

**Speaker 5 | 21:01**
Yeah, like the five similar sequences that were run previously.

**Wesley Donaldson | 21:01**
Yeah, the five similar sets that would run previously. Yeah, and I'm way outside my depth of knowledge.

**Brian | 21:06**
Yeah, and I'm way outside my depth of knowledge. I'm just saying, I wonder if you could get the wrong result in this approach.

**Wesley Donaldson | 21:11**
I'm just saying, I wonder if you could get the wrong results in this approach.

**Brian | 21:15**
There could be other approaches that we should layer on that could be better in some circumstances.

**Wesley Donaldson | 21:15**
There could be other approaches that we should layer on that could be better in some circumstances.

**Brian | 21:21**
That's all okay.

**Wesley Donaldson | 21:21**
That's all. Okay, yes, but I mean, maybe they are possible based on this too, right?

**Speaker 5 | 21:22**
Yeah, but yeah, I know.

**Brian | 21:24**
I mean, maybe it's possible based on this too, right?

**Wesley Donaldson | 21:28**
And you think that I think in that big time Brian, sometimes you can try and be too clever and just do a how many occurrences of this letter, these two letters in the circuit, you don't match.

**Sam Hatoum | 21:28**
You know, I second that. I second that big time, Brian. Like, sometimes you can try and be too clever and like, just doing a how many occurrences of this letter. These two letters in the circuit, you know, match and then, like, could yield better results, right?

**Wesley Donaldson | 21:38**
And then I could you have a results, right?

**Brian | 21:41**
Exactly.

**Wesley Donaldson | 21:41**
Exactly.

**Brian | 21:41**
Yeah, and the RAG search might give you something that looks better based on all of our cache, right?

**Wesley Donaldson | 21:41**
Yeah, and the RAG search might give you something that looks better based on all of our cache, right?

**Brian | 21:46**
And it actually isn't better than just deduplicating.

**Wesley Donaldson | 21:46**
And it actually isn't better than just duplicating.

**Sam Hatoum | 21:50**
What's interesting there, actually is you could if you ran lots of different mechanisms to find, like, you know, a variety of potential matches.

**Wesley Donaldson | 21:50**
Interesting. There actually is you if you ran lots of different mechanisms to find like a variety of potential matches.

**Sam Hatoum | 21:57**
And then you need something some intelligent, you know, organic or silicon to decide like which of those is the best candidate, right?

**Wesley Donaldson | 21:57**
And they need something some intelligent organic oil or silicon to decide like which of those is the best candidate, right?

**Sam Hatoum | 22:05**
So that could be another like interesting thing here is like, yeah, we just use this as a let's find similarities and then still like have a mechanism to decide which is the right one.

**Wesley Donaldson | 22:05**
So that could be another interesting thing. Yeah, let's use this as a... Let's find similarities and then still have a mechanism to decide which is where we want it to go.

**Sam Hatoum | 22:14**
EVAD basically... No, you've got to embrace this uncertain computing world we're in.

**Wesley Donaldson | 22:21**
You've got to embrace this uncertain computing.
Well, in... Well, I mean just... Mech expression itself.

**Speaker 5 | 22:27**
Well.

**Jeff | 22:27**
I mean just to cat compression itself. When you apply that, you're talking about pulling random samples.

**Wesley Donaldson | 22:31**
And we apply that fully. Rand up samples.

**Jeff | 22:34**
So your reliance on the outcome there is, you know, speculative anyway, right?

**Wesley Donaldson | 22:34**
So your reliance on the outcome there is speculative anyway. Actually, that point, if you get a result out of... Do you know it's the best or do you...?

**Brian | 22:47**
Actually that point if you get a result out of rag, do you know it's the best or do you [Laughter].

**Sam Hatoum | 22:54**
It's best for the.

**Speaker 5 | 22:55**
It's heuristic and it's so heuristic.

**Sam Hatoum | 22:59**
It's the Within the conditions.

**Jeff | 23:03**
Well, no, I was going to say you're going to need to have...

**Wesley Donaldson | 23:04**
You need to have... That's the point of what we were talking about earlier, which is at some point there has to be some way of intelligently understanding whether it's the best.

**Jeff | 23:06**
That's the point of what we were talking about earlier, which is at some point there has to be some way of intelligently understanding whether it's the best.
The criteria for that is something I think that's actually quite a bit beyond this team.

**Wesley Donaldson | 23:16**
The criteria for that is something I think that's actually quite a bit given this team.

**Jeff | 23:24**
That's where I'm getting to is like just like Brian said, I think we're running out of rope in terms of our understanding of the math here.

**Wesley Donaldson | 23:24**
That's where I'm getting to is like just like Brian said, I think we're running out of rope in terms of our understanding of the math here.

**Jeff | 23:34**
So when we start talking about this, it's not just straight up IO and it's not just like pulling data or anything like that we're used to in software engineering.

**Wesley Donaldson | 23:34**
So when we start talking about this, it's not just straight up IO and it's not just like pulling data or anything like that we're used to in software engineering now we're at the point where confidence has to be established mathematically.

**Jeff | 23:43**
Now we're at the point where confidence has to be established mathematically.

**Wesley Donaldson | 23:47**
So rag and all these other potential interjections or something that could have an effect on the outcome that is unintender or beneficial.

**Jeff | 23:47**
So rag and all these other potential interjections or something that could have an effect on the outcome that is unintender or beneficial. And we wouldn't necessarily know because we need to specifically understand the target and what values actually make sense.

**Wesley Donaldson | 23:59**
We wouldn't necessarily know because we can specifically understand the target and what values actually make sense.

**Jeff | 24:07**
So that's why I'm so excited about it because we're at the point now where we're past, I think, a lot of what we can do on the engineering side without the pure researchers coming in and telling us a better direction to look into.

**Wesley Donaldson | 24:07**
So that's why I'm so excited because we're at the point now where we're past, I think, a lot of what we can do on the engineering side without the pure researchers coming in and telling us a better direction to look into.

**Jeff | 24:23**
At least vetting what's been done so far so that we don't waste a bunch of other time building and stuff from here without that knowledge or that insight.

**Wesley Donaldson | 24:23**
At least vetting what's been done so far so that we don't waste a bunch of time building stuff for here without that knowledge or that insight.
I mean, you mentioned earlier about waiting for...

**Sam Hatoum | 24:34**
We mentioned earlier about waiting for the research team to give us these validations, whether that comes in the form of a module that we can run, that can do testing, or whether it's something else like if we're waiting, we don't want to be just sitting around doing nothing.

**Wesley Donaldson | 24:37**
The research team, these foundations, whether that comes in the form of a module that we can run, that can do testing, or whether it's something else like if we're waiting, we don't want to be sitting around doing nothing.

**Sam Hatoum | 24:48**
One idea might be then for us to build some of the infrastructure and primitives that we would need to, you know, to start building on this.

**Wesley Donaldson | 24:49**
One idea might be then for us to build some of the infrastructure primitives that we would need to start building them like it's spinback code so far, and some stuff has been stabilized, and it's not like we can double down on that grown-up picture session later today.

**Sam Hatoum | 24:56**
Like it's been backcoded so far and, you know, some stuff has been stabilized, some stuff not. Like we can double down on that. We have an architecture session later today, we can discuss that.

**Wesley Donaldson | 25:03**
We can just discuss that in...

**Sam Hatoum | 25:04**
And but that's just one idea is like, you know, do what we know how to do.

**Wesley Donaldson | 25:05**
So that's just one idea is like, you know, do what we know how to do.

**Jeff | 25:10**
Yeah, exactly.

**Wesley Donaldson | 25:10**
Yeah, exactly.

**Jeff | 25:10**
I don't want to do busy work either.

**Wesley Donaldson | 25:10**
I want to do busy work here. I just want to make sure that that's quite the whole point.

**Jeff | 25:12**
I just want to make sure that that's coming the whole point. I mean, I think there's been some questions that are brought up about what we're doing here, and I want to make that really clear.

**Wesley Donaldson | 25:14**
I mean, I think there's been some questions that are brought up about what we're doing here, and I want to make that really clear.

**Jeff | 25:22**
So just like we did on Cubid Core, for instance, I think the engineering team had no question whatsoever about what middleware for Cubage core configuration might do at the most fundamental level, not with all the bells and whistles and polishing it, but just here. This needs to facilitate messaging.

**Wesley Donaldson | 25:22**
So just like we did on Git Core, for instance, I think the engineering team had no question whatsoever about what middleware in the Cubage core configuration might do at the most fundamental level, not with all the bells and whistles and polishing it, but just here. This needs to facilitate messaging needs to make sure that MCP is the protocol we rely on.

**Jeff | 25:43**
It needs To make sure that MCP is the protocol we rely on, that we understand little things like the development of skills coming up and those kinds of things can be surfaced.

**Wesley Donaldson | 25:48**
We understand little things like the development of skills coming up and those kinds of things can be surfaced.

**Jeff | 25:54**
And I think we got pretty far with that.

**Wesley Donaldson | 25:54**
And I think we got pretty far with that.

**Jeff | 25:57**
We got pretty far with that. We're like, "Okay, now we at least know that a team could attach some sort of capability, a product, and an application, whatever it might be, a tool, even third parties."

**Wesley Donaldson | 25:57**
We're like, "Okay, now we at least know that a team could attach some sort of capability of a product and an application, whatever it might be, a tool, and third parties."

**Jeff | 26:07**
We at least don't have to think, "Well, gee whiz, if we had middleware and if we knew something about that, maybe it would do this, maybe it would..."

**Wesley Donaldson | 26:07**
We at least don't have to think, "Well, gee whiz, if we had middleware, if we knew something about that, maybe we would do this. Maybe we're much further past that just because of that work."

**Jeff | 26:15**
We're much further past that just because of that work.
So in this case, what we did was we got a definition together.

**Wesley Donaldson | 26:18**
So in this case, what we did was we got a definition and... Of that sounds like a cool thing to do for...

**Jeff | 26:22**
Hey, QM, that sounds like a cool thing to do for medication. Then talking with Florian and doing research.

**Wesley Donaldson | 26:26**
Then talking with Florian and doing research.

**Jeff | 26:32**
You know, we brought in stochastic depression and possibly a beneficial cycle in that.

**Wesley Donaldson | 26:32**
You know, we brought in stochastic depression and possibly a beneficial cycle in that.

**Jeff | 26:38**
Meanwhile, you guys were building out sort of like, "Hey, here's how rapidly we can get something up and running that we can look at, but we don't even need to..."

**Wesley Donaldson | 26:38**
Meanwhile, you guys are building out sort of like, "Hey, yourself rapidly can get something up." I'm running that you look at run... They're running up.

**Jeff | 26:45**
We don't even know if we need a Google.

**Wesley Donaldson | 26:46**
I like there are all kinds of questions. This is all up to this point, what I would consider to be throwaway work.

**Jeff | 26:47**
There are all kinds of questions. This is all up to this point, what I would consider to be throwaway work. You could throw the whole thing away tomorrow and do something completely different.

**Wesley Donaldson | 26:53**
You could throw the whole thing away. Tomorrow it would be completely different.

**Jeff | 26:57**
And no harm, no foul.

**Wesley Donaldson | 26:57**
And the on no foul.

**Jeff | 26:58**
We've learned a lot.

**Wesley Donaldson | 26:58**
We've learned a lot, and that's kind of the exercise that we went through.

**Jeff | 26:59**
And that's kind of the exercise we went through. And what's great is everybody's longing for that journey.

**Wesley Donaldson | 27:02**
And what's great is everybody' be to that journey.

**Jeff | 27:05**
We're all looking at this, we're all considering it, we're all thinking about it.

**Wesley Donaldson | 27:05**
We're looking at this, we're considering it, we're all thinking about it.

**Jeff | 27:07**
And I think a lot of us are now much more, you know, attuned to what error mitigation means.

**Wesley Donaldson | 27:07**
And I think a lot of us are now much more, you know, attuned to what error mitigation means.

**Jeff | 27:14**
You know, the product team has sort of a remit to go out and look at the field and see what's going on with other products and other solutions.

**Wesley Donaldson | 27:14**
You know, product team has sort of a remit to go and look at the field and see what's going on with other products and other solutions.

**Jeff | 27:21**
They're very nascent.

**Wesley Donaldson | 27:21**
They're very amazing.

**Jeff | 27:22**
When I spoke to Sasha about this during the offsite, it was clear, really clear that the other error mitigation techniques and products and things that have been put together...

**Wesley Donaldson | 27:22**
When I spoke to Sasha about this during the offsite, it was clear what really clear that the other mitigation techniques and products and things that are been put together are we even call them products the repos?

**Jeff | 27:37**
I wouldn't even call them products. The repos and the white papers, the ones from IBM, the ones from the most established players, are completely nascent.

**Wesley Donaldson | 27:40**
And then the white papers, the ones from IBM, the ones from the most established players are completely MACED.

**Jeff | 27:47**
They're not well tested, they're not well known.

**Wesley Donaldson | 27:47**
They're not well tested, they're not well known.

**Jeff | 27:50**
Just because they have an IBM association doesn't mean they're any good at all.

**Wesley Donaldson | 27:50**
Just because they have an IBM association doesn't mean they're any good at all.
So it was really interesting to talk to them about that stuff.

**Jeff | 27:54**
So it was really interesting to talk to them about that stuff. That's the knowledge and the level of understanding.

**Wesley Donaldson | 27:58**
That's the knowledge and the level of understanding if it's really going to bring this into focus.

**Jeff | 28:02**
I think that's really going to bring this into focus. But up until this point, you know, we.

**Wesley Donaldson | 28:04**
But up until this point, you know, we I think what we're doing is proving that team can sort of spin on a dime and put some stuff together and understand concepts and think about, you know, kind of the glue and facilitation of things from a software engineering perspective.

**Jeff | 28:06**
I think what we're doing is we're proving that the team can sort of spin on a dime and put some stuff together and understand concepts and think about, you know, kind of the glue and the facilitation of things from a software engineering perspective.
Like Sam and I have always we talked about this IO, getting the IO down.

**Wesley Donaldson | 28:20**
Like Sam and I always talk about this IO, getting the IO down, it's really interesting.

**Jeff | 28:25**
That's really interesting because it brings up all these thoughts and ideas.

**Wesley Donaldson | 28:26**
Brings up all these thoughts and ideas.

**Jeff | 28:29**
To me.

**Wesley Donaldson | 28:29**
To me, this is a prerequisite to us even being able to facilitate or address what comes out of the minds of Asa and Slack when they get into this and sink their teeth in.

**Jeff | 28:30**
This is a prerequisite to us even being able to facilitate or address what comes out of the minds of Asa and Slack when they get into this and sink their teeth in.
What I'm hoping is that instead of it being like, "Well, we're going to have to wait six months for them to figure it out," I want them to come in and comment on what's been done here and just tell us we're crazy, tell us it's a mess, throw it away, and start over. That's what I'm looking for.

**Wesley Donaldson | 28:43**
What I'm hoping is that instead of it being like, "Wow, we're going to have to wait six months for them to figure it out," I want them to come in and comment on what's been done here and just tell us we're crazy, tell us it's a mess, throw it away, and start over. That's what I'm looking for.

**Jeff | 28:55**
Now I think we're at that point where at least we want to understand if some of what we've done to this point is interesting or if it's clickable or where it falls short.

**Wesley Donaldson | 28:56**
I think we're at that point where at least we want to understand if some of what we've done to this point is interesting or if it's clickable or where it falls short.

**Jeff | 29:07**
The indication I got in just socializing the concept just with Asa was that what we're Doing is quite interesting.

**Wesley Donaldson | 29:07**
The indication I got from just socializing the concept just with Sam was that what we're doing is quite interesting.

**Jeff | 29:16**
So, I'm really interested to go into the next step, and I just want everybody to understand that there's a difference.

**Wesley Donaldson | 29:16**
So, I'm really interested to go into the next step, and I just want everybody to understand that there's a difference.

**Jeff | 29:24**
And I was just trying to explain this and try to talk to Anya about it.

**Wesley Donaldson | 29:24**
And I was just trying to explain this, to try to talk to Onion about this.

**Jeff | 29:27**
For instance, like there's innovation stuff and research.

**Wesley Donaldson | 29:27**
It's like there's innovation stuff and research.

**Jeff | 29:31**
There's sort of product development, and there's this really bizarre, nebulous area in the middle.

**Wesley Donaldson | 29:31**
There's sort of product development, and there's this really bizarre, nebulous area in the middle.

**Jeff | 29:37**
I don't know what the hell it is, but I do know that in the early stages, the most beautiful thing is not to try to own this thing and polish it, make it perfect, but just to let things be explored and try to understand some of the things that may be a challenge.

**Wesley Donaldson | 29:37**
I don't know what the hell it is, but I do know that in the early stages, the most beautiful thing is not to try to own this thing and polish it, make it perfect, but just to let things be explored and try to understand some of the things that may be a challenge.

**Jeff | 29:57**
Or even just go down a tangent and try something out and see if it sticks.

**Wesley Donaldson | 29:57**
You can just go down the tangent and try something out and see if it sticks.

**Jeff | 30:01**
This is really good stuff when it comes to innovation because it's always produced, in my experience, very interesting things, even if it's in and of itself wasn't like the answer or the final approach.

**Wesley Donaldson | 30:01**
This is really good stuff when it comes to innovation because it's always produced, in my experience, very interesting things. Even if it did, in it of itself wasn't an answer or the final sort of approach.

**Jeff | 30:16**
So I think it's really important to relax and let that kind of process happen, but to dive in and take part in it.

**Wesley Donaldson | 30:16**
So I think it's really important to relax and let that kind of process happened, but to dive in and take part in not everything has to have deep formal specification.

**Jeff | 30:25**
Not everything has to have a deep formal specification. Not everything has to have a deep formal specification. Not everything has to have some sort of measure twice and cut once approach to every little thing.

**Wesley Donaldson | 30:28**
Not everything has to have, you know, some sort of a, you know, measure twice and cut once approach to every little thing is there's lots of those principles that should be applied even in the innovative stages, you know, test driven and all that kind of stuff, for instance.

**Jeff | 30:37**
There are lots of those principles that should be applied even in the innovative stages, test-driven and all that kind of stuff, for instance.
But it's just really interesting because I think what we get is we get the product that we're building here is what comes into our minds, not what we're putting out.

**Wesley Donaldson | 30:45**
But it's just really interesting because I think what we get is we get the product that we're building here is what comes into our minds, not what we're putting out.

**Jeff | 30:54**
Like we're getting some sort of formation.

**Wesley Donaldson | 30:54**
We're getting some sort of formation together collectively and cohesively.

**Jeff | 30:56**
Together, collectively and cohesively. What are we actually considering here so that we can even have a conversation with Saja and Slack?

**Wesley Donaldson | 30:59**
What are we actually considering here so that we can even have a conversation with Saja and Slack?

**Jeff | 31:06**
Because I'll tell you straight up, six months ago, if Slava and Sasha just arrived and said, hey, can you do this thing?

**Wesley Donaldson | 31:06**
Because I'll tell you straight up, six months ago, if Slack and Saja just arrived and said, "Hey, can you do this thing?"

**Jeff | 31:14**
This and all this other stuff.

**Wesley Donaldson | 31:14**
This. This. And all this other stuff, I'll bet you not a single person on this call would know what the work they were talking about.

**Jeff | 31:16**
I'll bet you not a single person on this call would know what the work they were talking about.
So I love where we are.

**Wesley Donaldson | 31:21**
So I love where we are. I love that we're doing this, and I want to continue to facilitate this happening.

**Jeff | 31:24**
I love that we're doing this, and I want to continue to facilitate this happening. But there is a point where you get to where it's like, "Okay, we have this core conceptual thing now. Let's attach something to it, and let's talk about how that might work."

**Wesley Donaldson | 31:29**
But there is a point where you get to where it's like, "Okay, we have this core conceptual thing now, let's attach something to it, and let's talk about how that might work," and then a whole another set of stuff comes out of that.

**Jeff | 31:39**
And then a whole another set of stuff comes out of that, challenges new work for engineering, some refactoring, whatever it might be.

**Wesley Donaldson | 31:42**
Challenges, new work for engineering, some refactoring, whatever it might be.

**Jeff | 31:47**
I mean, without the efforts that we have made in that way, just purely wide open and innovative, we would have nothing to show the investors.

**Wesley Donaldson | 31:47**
I mean without the efforts that we've made in that way, just purely wild open data. We have nothing to show the investors, not a single thing.

**Jeff | 31:59**
Not a single thing.
I'm so proud of you guys for continuing to allow this to happen, for continuing to take part in it, for the Xolv, your team, to push forward.

**Wesley Donaldson | 32:00**
And I'm so proud of you guys. We're continuing to allow this to happen. We're continuing to take part in it. For your team to push forward for the tough questions we've been asking all of those things.

**Jeff | 32:10**
For the tough questions we've been asking all those things, and Lucas and Cedric are doing the work of integration, working with the teams.

**Wesley Donaldson | 32:13**
Lucas and Cedric are doing the work of integration, the work of consumers.

**Jeff | 32:18**
All of those things added up to, for instance, Lucas did a bunch of work on definitions and stuff, and he really worked hard on refining that for C. Well, guess what? That saved our ass just last week completely.

**Wesley Donaldson | 32:18**
All of those things added up to my friends. Lucas did a bunch of work on depositions and stuff, and he really worked hard on refining that for C. Well, guess what? That saved our ass just last week quite completely.

**Jeff | 32:32**
Because you don't know this, Lucas.

**Wesley Donaldson | 32:32**
Because you don't know. This log is one of the meeting.

**Jeff | 32:34**
Because you weren't in the meeting but the meeting within these guys who are doing technical due diligence on us.

**Wesley Donaldson | 32:35**
But meeting with these guys are doing technical due diligence on us.

**Jeff | 32:39**
I was able to walk through a really rudimentary example using ChatGPT code, which was a train wreck in the company presentation at the offsite, but in the investor meeting, it was tight.

**Wesley Donaldson | 32:39**
And I was able to walk through a really rude entry example using Claude code, which is kind of a train wreck in the company presentation at the Offset.
But in the investor meeting, it was tight.

**Jeff | 32:50**
I was able to show these guys how this would work, why it was set up that way, and how agent-like what agent-like actually means in the scheme of things.

**Wesley Donaldson | 32:50**
I was able to show these guys how this would work, why it was set up that way, and how agent-like what agent-like actually means in the scheme of things.

**Jeff | 33:01**
And they loved it.

**Wesley Donaldson | 33:01**
And they loved it.

**Jeff | 33:02**
They loved it.

**Wesley Donaldson | 33:02**
They loved it.

**Jeff | 33:02**
And so that's the point.

**Wesley Donaldson | 33:03**
And so that's the point. I mean, sometimes we're just building things to fill in our understanding and our team knowledge of things.

**Jeff | 33:04**
Like sometimes we're just we're building things to fill in our understanding and our team knowledge of things. And it's a really kind of a judgment call as to where the rubber needs to start meeting the road in terms of it becoming real.

**Wesley Donaldson | 33:11**
And it's a really kind of a judgment call as to where the rubber needs to start beating the road in terms of becoming real.

**Jeff | 33:18**
And it gets confusing because it's very, you know, don't go too far down that road because you'll end up building something that's very opinionated.

**Wesley Donaldson | 33:18**
It gets confusing because it's very... Don't go too far down that road because you'll end up building something that's very opinionated.

**Jeff | 33:26**
So I totally agree with you, but at the same time, go down some road.

**Wesley Donaldson | 33:26**
Something over with you, but at the same time, go down on some road, maybe go down three roads, and it's fascinating.

**Jeff | 33:31**
But maybe go down three roads, you know? And it's fascinating. I mean, you may notice recently at least, and I'm just.

**Wesley Donaldson | 33:37**
You may have noticed recently at least.
And I'm just filibustering a bit here, but recently I'm shifting my arm back to what it was when I joined this company.

**Jeff | 33:42**
Filibustering a bit here, but recently, I'm shifting my own role back to what it was when I joined this company.

**Wesley Donaldson | 33:50**
I used to be the guy who was.

**Jeff | 33:50**
I used to be the guy who was... When I joined this company, my title was Innovation.

**Wesley Donaldson | 33:52**
When I Joined this company, my title was Innovation.

**Jeff | 33:57**
That's what I was supposed to work on, not running product engineering at all.

**Wesley Donaldson | 33:57**
That's what I was supposed to work on, not running product engineering at all.

**Jeff | 34:03**
We tried to hire someone for product engineering.

**Wesley Donaldson | 34:03**
We tried to hire someone for product engineering.

**Jeff | 34:05**
We kept coming up with very weak candidates for people that didn't fit.

**Wesley Donaldson | 34:05**
We kept coming up with very weak candidates for people that didn't fit, and I was asked to take it over.

**Jeff | 34:10**
And I was asked to take it over.
And so I did.

**Wesley Donaldson | 34:11**
And so I did.

**Jeff | 34:12**
But I'm way more interested in throwing shit against the wall and seeing if it sticks.

**Wesley Donaldson | 34:13**
But I'm way more interested in throwing it against the wall as if it sticks, moving on to the next ball.

**Jeff | 34:18**
Moving on to the next wall. That's what I'm really interested in.

**Wesley Donaldson | 34:19**
That's what I'm really interested in, and I know that it produces something that people can take and then run with it.

**Jeff | 34:21**
I know that it produces something that people can take
and then run with it, and I want to make sure that there's a constant feed of those kinds of things coming to our teams so that you guys can then go, "That one looks really cool."

**Wesley Donaldson | 34:26**
And I want to make sure that there's a constant sort of like feed of those kind of things coming to our teens so that you guys can then go, that one looks really cool.

**Jeff | 34:36**
Let's polish that and do it right without getting lost in some horrible mess.

**Wesley Donaldson | 34:36**
Let's polish that and do it right without getting lost in some horrible mess.

**Jeff | 34:41**
That, you know, is kind of like the QA I hub where it was they had a plan, but they didn't work with the engineering team and it ended up being something that really wasn't scalable or done from an engineering perspective correctly.

**Wesley Donaldson | 34:41**
That, you know, is kind of like the QI hub where it was they had a plan, but they didn't work with the engineering teams and ended up being something that really wasn't scalable or done from an engineering perspective. Frankly, at least the things that we're talking about, we're bringing the principles and we're bringing the engineering experience, and it's at least something that has a viable foundation in everything we do.

**Jeff | 34:54**
At least the things that we're talking about, we're bringing the principles and we're bringing the engineering experience, and it's at least something that has a viable foundation in everything we do.

**Wesley Donaldson | 35:06**
So anyway, end of speech.

**Jeff | 35:06**
So anyway, end of speech. I just wanted to make sure everybody knows why we're doing what we're doing and that we're just going to continue to look for innovations as we have time.

**Wesley Donaldson | 35:07**
I just wanted to make sure everybody knows why we're doing what we're doing and that we're just going to continue to look for innovations as we have time.

**Jeff | 35:17**
That to me around the corner, we won't have time to... I mean, around the corner will be on road maps and schedules and plans and have to deliver.

**Wesley Donaldson | 35:17**
That to me around the corner, we will have time to... I mean, around the corner, we will be on road maps, schedules and plans and have to deliver.

**Jeff | 35:27**
That's a different animal, so hopefully that makes sense.

**Wesley Donaldson | 35:27**
That's a different element. So hopefully that makes sense.

**Jeff | 35:31**
I get questions.

**Wesley Donaldson | 35:31**
If any questions.

**Jeff | 35:38**
Sweet.

**Wesley Donaldson | 35:38**
SE no questions.

**Jeff | 35:39**
I have no questions.

**Wesley Donaldson | 35:42**
Anyway, let's go forward with this and I'll try to get these two guys deeply involved right away.

**Jeff | 35:42**
Anyway, let's go forward with this and I'll try to get these two guys deeply involved right away. Sasha is available immediately, and I think he's the first person I'm going to try to bring in.

**Wesley Donaldson | 35:50**
Sasha is available immediately, and I think he's the first person I'm going to try to bring in.

**Jeff | 35:56**
I may even invite him to the engineering round table tomorrow just to see if he wants to pontificate on his knowledge and understanding of the whole space.

**Wesley Donaldson | 35:56**
I may even invite him to the engineering round table tomorrow just to see if he wants to pontificate on his knowledge and understanding of the whole space.

**Jeff | 36:11**
So, thanks for everybody's time today.

**Wesley Donaldson | 36:11**
So thanks for really...

**Brian | 36:14**
Thank you, everyone. So, demo.

