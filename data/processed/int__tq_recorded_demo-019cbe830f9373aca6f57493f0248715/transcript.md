# INT: TQ Recorded Demo - Mar, 05

# Transcript
**Wesley Donaldson | 00:42**
Good morning.

**Speaker 2 | 00:44**
Are you today?

**Wesley Donaldson | 00:45**
Happy demo day. Let me post our agenda in the channel.

**Speaker 2 | 00:48**
I had to do something called the window spring is coming, and the sun actually fell on my face, and I cannot see anything than the sun, so it's annoying.

**Wesley Donaldson | 01:16**
Let's just give Nicholas a couple of minutes.
Spring is coming, and the sun actually fell on my face, and I cannot see anything than the sun, so it's annoying.

**Speaker 2 | 01:34**
I'm happy that the sun is there.

**Wesley Donaldson | 01:34**
I'm happy that the sun is there.

**Speaker 2 | 01:35**
It's much better than winter and snow, but yeah, it's annoying.

**Wesley Donaldson | 01:35**
It's much better than winter and snow, but yeah, it's annoying. No worries. I did actually in my previous office, I had a film on the tint on the windows just to cut back on some of the glare. That really helped.

**Speaker 2 | 01:50**
Okay.

**Wesley Donaldson | 01:51**
And it didn't look too weird. It seemed only half the windows tinted like silver.

**Speaker 2 | 01:56**
It's some kind of color, like black or it was silver.

**Wesley Donaldson | 02:00**
So it was black, but it was like a... It was black, but it was like a... The MIT the type of tint was specifically intended to block light. The harshness of the light. It wasn't just about the color, it was more about just the efficiency of the type of tint.
I'll look through my Amazon, I'll send it to you.

**Speaker 2 | 02:14**
Okay, sure.

**Wesley Donaldson | 02:16**
Okay? Sure.
Just give me one second.

**Speaker 2 | 03:11**
So maybe do not waste anybody's time.

**Wesley Donaldson | 03:11**
So maybe do not waste any time. Maybe and just...

**Speaker 2 | 03:14**
Maybe I can just start. And.

**Wesley Donaldson | 03:16**
Right. Yeah. Let's see if Nicholas can join us. I'll kick us off, so no worries, I'll kick us off.

**Speaker 2 | 03:22**
I cannot hear you. Is she here?

**Wesley Donaldson | 03:29**
Yeah, hopefully, Nicholas will be able to join us. I'll so I can work on him offline.
So for today, we're going to focus on just getting chewing us up relative to what Jeff, what Ruben, and Brian have discussed with us last week in our past demo specifically. DAM is going to take us through walking us through the mirror board that trues up Jeff's document with our current understanding. What are the current steps within the quantum process? Where is our application relative to those steps? We're going to take you through a test harness and the report that it generates. The goal of that test harness is to demonstrate how we're addressing the individual steps within the implementation process.
Then, if we have bandwidth, we'll spend a little bit of time just working through our current thinking around event sourcing and the events that we've built into the pipeline. If Nicholas can work through his... There you go. We'll focus around just the learnings from our recent sync with Ruben.
So walking through how we have updated our understanding and the quantum process relative to QMM as well. Then, if we have a little bit of extra time, we'll focus on just an incremental feature that Nicholas has been working on around just multilayer QMM placement and within deep circuits.
All right, so let's jump straight in. DOM, over to you.

**Speaker 2 | 04:48**
Yeah, sure, so let me share this screen.

**Wesley Donaldson | 04:49**
Sure. So let me share this screen.

**Speaker 2 | 04:56**
Nope, actually, the entire screen is going to be better. Right?

**Wesley Donaldson | 04:56**
Not actually, the entire screen is going right.

**Speaker 2 | 05:03**
Yeah, so, yeah, as was already mentioned, my first goal, our first goal, was to translate Jeff's document, and we did it just this on the Miro board.

**Wesley Donaldson | 05:03**
Yeah, so, as we already mentioned, my first goal, our first goal, was to translate Jeff's document, and we did it just this on the Miro board.

**Speaker 2 | 05:18**
So actually right now you can see 13 steps, and each of the steps is a representation of the step in the document, but with just the core information, the most important information that we should know from the billing system perspective, let's say.

**Wesley Donaldson | 05:18**
So actually right now you can see 13 steps, and each of the steps is a representation of the step in the document, but with just the core information, the most important information that we should know from the billing system perspective, let's say.
So yeah, as you can see, each step includes four information.

**Speaker 2 | 05:37**
Yeah, as you can see, each step includes four information. It's like the overall description of what the node is about the input and output.

**Wesley Donaldson | 05:42**
It's like the overall description of what the node is about the input and output, and there is a little bit of logic that should be done inside of the node to fit the requirements.

**Speaker 2 | 05:49**
And there is a bit of a little bit of logic that should be done inside of the node to fiill the requirements, what we already know.

**Wesley Donaldson | 06:00**
What we already know.

**Speaker 2 | 06:02**
For example, as a bonus, I can say that we thought, I thought actually on the very beginning as the initial step, that each step can be represented as a representation of a node.

**Wesley Donaldson | 06:02**
For example, as a bonus, I can say that we thought actually on the very beginning as the initial step, but each step can as a representation of a mode.

**Speaker 2 | 06:17**
And right now we know that it's not actually a true.

**Wesley Donaldson | 06:17**
Right now we know that it's not actually true.

**Speaker 2 | 06:21**
So for example, those first two, like the circuit input and normalizer node, they could be treated like the circuit input node because the normalizer should be a part of the circuit, and it should just do some additional logic.

**Wesley Donaldson | 06:21**
So for example, those first two, like the circuit input and normalizer node, they could be treated like the ST input node because analyzers should be a part of the circuit and it should just do some additional logic. For the strip input, actually, the policy voice and visibility doesn't look like a node as well, it's more like the system behavior.

**Speaker 2 | 06:38**
For the circuit input, actually, the policy and flexibility doesn't look like a node as well.
It's more like the system behavior. So we know that already, but this one was really helpful to actually understand the direction and the pipeline.

**Wesley Donaldson | 06:48**
So we know that already, but this one was very helpful to actually understand the direction of the pipeline and that was described in the documents.

**Speaker 2 | 06:55**
That was described in the document. So yeah, that was what we created.

**Wesley Donaldson | 07:00**
So yes, that was what we created. And having this, we went to another thing that was the mapping.

**Speaker 2 | 07:06**
Having this, we went to another thing that was the mapping.
So we actually once we know what needs to be covered based on the document, we took a look at the codebase on the system that we currently have.

**Wesley Donaldson | 07:12**
So we actually once we know what needs to be covered based on the document, we took a look at the codebase on the system that we currently have.

**Speaker 2 | 07:25**
And there are things that actually we already have.

**Wesley Donaldson | 07:25**
And there are things that actually we already have.

**Speaker 2 | 07:29**
So as I said, the circuit input node is something that we have and part of this node, there are two steps like the circuit input and normalizer.

**Wesley Donaldson | 07:29**
So as I said, the circuit input node is something that we have and part of this node. There are two steps like the st INP and analyser.

**Speaker 2 | 07:40**
There are things that are already implemented, and there are things that we are still missing.

**Wesley Donaldson | 07:40**
There are things that are already implemented, and there are things that we are still missing.

**Speaker 2 | 07:45**
There are some extra features like those fancy diagrams and so on.

**Wesley Donaldson | 07:45**
There are some extra features like those fancy diagrams and so on.

**Speaker 2 | 07:51**
The same with...

**Wesley Donaldson | 07:51**
The same with...

**Speaker 2 | 07:52**
Sorry.

**Wesley Donaldson | 07:52**
Sorry.

**Speaker 2 | 07:52**
The same with...

**Wesley Donaldson | 07:52**
The same with the video producer, for example.

**Speaker 2 | 07:53**
With the video producer, for example.

**Wesley Donaldson | 07:56**
And simulator mode.

**Speaker 2 | 07:56**
And simulator mode but there are still some places that are not implemented, for example, the QP execution, which actually uses the real QP hardware.

**Wesley Donaldson | 07:58**
But there are still some places that are not implemented, for example, the QP execution, which actually uses the real QP hardware.

**Speaker 2 | 08:08**
It's something that we know should be done based on the documentation, but it's not implemented in the current system.

**Wesley Donaldson | 08:08**
It's something that we know should be done based on the documentation, but it's not implemented in the current system.
Yeah, because the application that I system should be event driven and is at the moment event driven somehow.

**Speaker 2 | 08:18**
And yeah, because the application, the entire system should be event driven, and it is at the moment event driven somehow. And I want to spend some time on creating the event sourcing diagram.

**Wesley Donaldson | 08:28**
I want to spend some time creating the event sourcing diagram.

**Speaker 2 | 08:34**
Let's say.

**Wesley Donaldson | 08:34**
Let's say.

**Speaker 2 | 08:35**
So the quick explanation that it's separated into a few tickets, let's say, sticky notes, that's the word I was looking for.

**Wesley Donaldson | 08:35**
So the quick explanation that is separated into a few tickets, let's say, and speaking of, that's the word I was looking

**Speaker 2 | 08:47**
So for example the.

**Wesley Donaldson | 08:47**
So for example, the. The green one is like the user action that the user does on the system, like clicking a button to create a pipeline.

**Speaker 2 | 08:48**
The green one is like the user action that the user does on the system, like clicking a button to create a pipeline. The blue one is slightly common.

**Wesley Donaldson | 08:55**
The blue ones like a common will happen when user click the button and when user clicked the button we triggered the user triggered the command in the system which is named create pipeline.

**Speaker 2 | 08:57**
What happened when the user clicked the button?
When the user clicked the button, we triggered the user-triggered command in the system, which is named "create pipeline." It creates the event which is the "pipeline created."

**Wesley Donaldson | 09:07**
It creates the event which is the "pipeline created."

**Speaker 2 | 09:10**
And then another.

**Wesley Donaldson | 09:10**
Then other things can happen based on the user interaction.

**Speaker 2 | 09:11**
Things can happen based on the user interaction.
For example, this one like commands can be triggered by the user or by other events.

**Wesley Donaldson | 09:16**
For example, this one, like commands can be triggered by the user or by other events.

**Speaker 2 | 09:23**
So for example, when the circuit form is filled and there is an event like "circuit submitted," the process for normalizing the circuits should be treated on the system to normalize the circuit.

**Wesley Donaldson | 09:23**
So for example, when the circuit form is filled and there is an event like "circuit submitted," the process for normalizing the circuits should be treated on the system to normalize the circuit.

**Speaker 2 | 09:38**
So this is their representation of how this should be working.

**Wesley Donaldson | 09:38**
So this is the representation of how this should be working.

**Speaker 2 | 09:44**
And the.

**Wesley Donaldson | 09:44**
And yeah, so on the mirror, I think.

**Speaker 2 | 09:45**
Yeah, so on the mirror, I think that's all.

**Wesley Donaldson | 09:49**
I think that's all.

**Speaker 2 | 09:51**
And Wes already mentioned that, we want to show you the M test harnesses.

**Wesley Donaldson | 09:51**
We already mentioned that we want to show you the test harnesses.

**Speaker 2 | 09:58**
So flex there's the code base.

**Wesley Donaldson | 09:58**
So there's the code base. Let me actually remove the old one.

**Speaker 2 | 10:02**
Let me actually remove the old one. Yep.
So yeah, in the terminal we can just run the PayPal proof, but actually runs 14 tests.

**Wesley Donaldson | 10:06**
So in the terminal you can just run the PayPal proof that actually runs 14 tests, two tests for each module.

**Speaker 2 | 10:16**
There are two tests for each module. By module, I understand, but by module, I mean that the circuit input result, viewer, parameter, optimizer...

**Wesley Donaldson | 10:19**
By module, I understand, but by module I mean that if you can input the viewer environmental optimizer, all of those nodes that you can see in the pipeline.

**Speaker 2 | 10:25**
All of those nodes that you can see in the pipeline.
So we can see that.

**Wesley Donaldson | 10:30**
So we can see that those tests just passed.

**Speaker 2 | 10:31**
That those tests just passed. We're testing two things.

**Wesley Donaldson | 10:34**
We're testing two things.

**Speaker 2 | 10:36**
Mostly it's like each node when it's triggered, it produces some events, like it puts some events that this happened in the system during processing that node.

**Wesley Donaldson | 10:36**
Mostly it's like each node when it's triggered, it produces some events like it puts some events that this happened in the system during processing the node.

**Speaker 2 | 10:52**
We actually test if there are all nodes that should happen and if they are in a good order.

**Wesley Donaldson | 10:52**
We actually ask if there aren't all nodes that should happen and if they are in a good order.

**Speaker 2 | 11:00**
So when we... When I created the test, we can actually open this here.

**Wesley Donaldson | 11:00**
So when you kind of created the test, we can actually open this here.

**Speaker 2 | 11:08**
Y yep.

**Wesley Donaldson | 11:08**
Y Yep.

**Speaker 2 | 11:08**
So, that's just the just record.

**Wesley Donaldson | 11:08**
So, that's just the, ch record.

**Speaker 2 | 11:12**
And for example, we can take...

**Wesley Donaldson | 11:12**
And for example, we can take, variant producer.

**Speaker 2 | 11:16**
Variant producer. That's what I wanted to show you.

**Wesley Donaldson | 11:17**
That's what I wanted to show you.

**Speaker 2 | 11:19**
So yeah, this is the test that proves that the VARIANTDUCER node works.

**Wesley Donaldson | 11:19**
So this is a test that proves that the VARIANTDUCER node works.

**Speaker 2 | 11:25**
We can output on the info, and for example, there's an event like there's the...

**Wesley Donaldson | 11:25**
We can open the info and for example, there's an event like there's the... Yeah, so we have two nodes in the pipeline.

**Speaker 2 | 11:33**
Yeah, so we have like two nodes in the pipeline. There's a circuit input and variant producer and circuit input have some data like the circuit and it's, output those data and variant producer gets those circuit as an input.

**Wesley Donaldson | 11:36**
There's a secret input and a variant producer, and secret inputs have some data by the circuit, and it outputs those data, and the variant producer gets those circuits as an input.

**Speaker 2 | 11:53**
It actually runs the...

**Wesley Donaldson | 11:53**
It actually runs the Claude with some instructions, and for the test purpose, just add a correction and just ask for just one variant.

**Speaker 2 | 11:55**
The Claude with some instructions, and for the test purposes, just add an error correction and just ask for just one variant.
As the data that it gets, it's the same circuit like the original one which is saved like the baseline, and the variant that was created by the LLM is added to the data as well, and it's output that it's collected as an output of this node.

**Wesley Donaldson | 12:04**
This is the data that it gets, and it's the same circuit like the original one which is saved like the baseline, and the variant that was created by the LLM is added to the data as well. And it's output that it's collected as an output of this novel.

**Speaker 2 | 12:26**
So that's the explanation in the event how it works and what it does.

**Wesley Donaldson | 12:26**
So that's the explanation there even how it works and what it does.

**Speaker 2 | 12:32**
And last thing I know, we promised that there won't be any fancy UI think.

**Wesley Donaldson | 12:32**
Last thing I know, we promised that there wouldn't be any fancy, I think.

**Speaker 2 | 12:39**
But there is actually one button that we added, which is the events.

**Wesley Donaldson | 12:39**
But there is actually one button that we added with the events.

**Speaker 2 | 12:45**
So when there... I can actually create a very new one.

**Wesley Donaldson | 12:45**
So when I can actually create a very new one.

**Speaker 2 | 12:49**
Yeah, so that's the new pipeline.

**Wesley Donaldson | 12:49**
Yeah, so that's the new pipeline.

**Speaker 2 | 12:52**
When we put the circuit input here, we can click on events, and we can see that there is an event pipeline created.

**Wesley Donaldson | 12:52**
When we put the circuit input here, we can click on events, and we can see that there is an event pipeline created. Pipeline updated because of the note of the...

**Speaker 2 | 13:00**
Pipeline updated because of the node of the... That note new note appeared to this pipeline when I remove this one and actually let's say our introducer simulator result viewer, we can run this pipeline.

**Wesley Donaldson | 13:06**
And the note new note appeared to this. To this pointline when I removed this from. And actually let's see what in producer simulator result you are looking around the pipeline and in the meantime you can see that there is more events like again pipeline updated no other about the loser by plan updated again node added simulator node added ussic viewer.

**Speaker 2 | 13:22**
And in the meantime, we can see that there is more events like again pipeline updated note added Variant producer pipeline updated again note added Simulator note added Result Viewer. So all of those events are tracked by events in the system.

**Wesley Donaldson | 13:37**
So all of those events are tracked by events in the system that check...

**Speaker 2 | 13:45**
Let me check if that's... No, it should take a few.

**Wesley Donaldson | 13:48**
No, it should take like a few.

**Speaker 2 | 13:52**
Okay, it's done.

**Wesley Donaldson | 13:52**
Okay, it's done.

**Speaker 2 | 13:53**
So now when we go to events, we should see that to put the...

**Wesley Donaldson | 13:53**
So now when we go to events, we should see that...

**Speaker 2 | 14:06**
Okay, so I... There are a few... Maybe too far.

**Wesley Donaldson | 14:06**
Okay, so I... Too far.

**Speaker 2 | 14:12**
Okay, it's hard to read that JSON, but it... What I wanted to show you.

**Wesley Donaldson | 14:12**
Okay, it's hard to read the JSON, but it's... Well, I wanted to show you, okay?

**Speaker 2 | 14:18**
Okay, there's a variant producer.

**Wesley Donaldson | 14:18**
There's a bar introducer.

**Speaker 2 | 14:20**
So, yeah, and it's an output of this variant producer event. It actually includes the same as we already saw in the test harnesses.

**Wesley Donaldson | 14:20**
So, yes, and it's an output of this variant producer event. It actually includes the same as we already saw in the test harnesses.

**Speaker 2 | 14:36**
So it's like the baseline circuit and some variants like the repetition 3Q and layer 1Q and layer 2 and so on.

**Wesley Donaldson | 14:36**
So it's like the baseline circuit and some variants like the repetition 3Q and layer 1Q and layer 2 and so on.

**Speaker 2 | 14:46**
So that's another proof and somehow an explanation of the system workflow.

**Wesley Donaldson | 14:46**
So that's another proof and somehow an explanation of the system workflow, what events are where, and so on.

**Speaker 2 | 14:54**
What events? When and so on? Yeah, actually, that's it.

**Wesley Donaldson | 14:57**
Yeah, actually, that's nice, no questions.

**Speaker 2 | 14:59**
Wes, any question?

**Wesley Donaldson | 15:02**
More just a bit of framing. So, the effort that Don went through touched on two important parts. This idea of understanding where we are with what the processes are and where our system is, where IO is currently to that process, and then providing transparency at the module level of aligning to those different steps and showing that we can... How we've aligned to those steps.
If you think it a little bit more by approaching this very modularly, we can talk a little bit about maybe this module can be run with these inputs and with these outputs, so you can think of them. It's not constrained only to just a UI visual representation. Having that deep understanding from the doc from the Miro document, as well as showing this modular event-based approach, we can imagine a situation where we can build out individual modules. Add more detail, more functionality, more clarity to each module because now we understand where they fit in the steps, what their inputs and outputs are, and how the chaining of them is. Being able to report on that chaining.
So, I'm going to hand it over to Nicholas, and Nicholas is going to reinforce the idea of clarity and understanding relative to how the process should work. Based on some experience, his recent syncing session with Ruben.
So, Nicholas Overdu...

**Speaker 2 | 16:17**
No, we... I can hear you at least.

**Wesley Donaldson | 16:19**
I cannot hear you either.

**Speaker 2 | 16:24**
No.

**Wesley Donaldson | 16:24**
No.
Nicholas will be right back.

**Speaker 2 | 16:35**
Hopefully.

**Wesley Donaldson | 16:38**
My apologies. I actually do have a conflict at this time. So, Don, if I can make you the lead for the meeting and continue the agenda.

