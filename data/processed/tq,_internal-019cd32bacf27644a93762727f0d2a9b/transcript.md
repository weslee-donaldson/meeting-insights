# TQ, Internal - Mar, 09

# Transcript
**Wesley Donaldson | 00:02**
Good morning, gentlemen.

**Nicolas Berrogorry | 00:07**
Morning. Hell.

**Wesley Donaldson | 00:11**
All right, let me grab my meeting share. Thank you, guys, for putting the time in. Thank you for the conversation this morning about, "Do we feel like we got there?" It's just good to have a reflection on where we are. Let's act.
I mean, a retrospective, if you would, let's share. I think this guy... Okay, do you see this?

**Dominik Lasek | 00:34**
I can see that.

**Wesley Donaldson | 00:35**
Okay, I'm just going to give you a top line from a conversation that is part of my one-on-one with Sam.
We specifically talked about where we are with TQ and where we are and how we should be moving forward. I'm going to distill it down quite a bit. I think the critical takeaway is this idea that we focus more on the orchestration of the system.
We've built a system that could take in additional nodes. We've built a system that can move information through. We've built a system that provides transparency, so focus more on module modernization and orchestration of the system, building a robust experience that we can add more steps to, and we can add more implementation around particular steps.
That's the general... That's one point from his direction. The other point from his direction is... Nicholas, what you've been leading, keeping it relevant... Make sure it continues to be grounded with the conversations you've been having with Florian, conversations you've been having with Reuben.
So in general, I think Sam is aligned. I did raise the concern that we need to find where that point is between what is just enough to prove the PC versus we're now implementing and full transparency.
I think that's an ongoing conversation. We didn't... I don't think we have a clear answer in that yet. But the main value that we need to deliver is it's grounded in what we've built, and then it is something that we've built that can be developed and grown over time as we get additional direction around individual steps.
So that's not new to anyone, but I think just giving you the clarity that that's Sam aligned to those. Any questions there? Question no, it's the direction basically that we have from Sam based on the orchestration, what does it mean for us are there yeah, so there is we can jump into that now.

**Dominik Lasek | 02:12**
Questions about the first thing as well. Okay, so based on the orchestration, what does it mean for us? Are there any tickets, things that...

**Wesley Donaldson | 02:29**
So on the board, we capture the things that we talked about yesterday and this. I try to make sure I align them back to Sam's direction. So we have the existing work. Nicholas, you were supposed to get to a good stopping point on this. Just throw a comment or two on this and then get to a good stopping point so we can close this out.
Then if there were additional things that we wanted to target, we're going to create tickets and throw them in the backlog. So maybe... Then the other individual things, specific things that we talked about, for example, creating the sample circuits.
I have tickets on the board for those for us to pull in. Same idea we talked a little bit about. "Hey, can we answer Brian's request for some kind of rag or some kind of store information over time so we could use it for the future?" Not sure why he sounds like that, but you get the idea.
So, we have those tickets on the board to pull in, but before we do that, maybe let's open it for status. Just talk me through where we are and in-progress work. Nicholas, why not start with you?

**Dominik Lasek | 03:30**
Okay.

**Wesley Donaldson | 03:30**
Okay, so I've been spending most of my day today trying to continue the process of grounding this.

**Nicolas Berrogorry | 03:31**
So I've been spending most of my day today trying to continue the process of grounding this. Like grounding what we already have.

**Wesley Donaldson | 03:40**
Grounding what we already have.

**Nicolas Berrogorry | 03:42**
And...

**Wesley Donaldson | 03:42**
And I'm studying light today.

**Nicolas Berrogorry | 03:43**
And I'm studying a light today. Let's say what I'm doing is basically grabbing the existing circuit diagram.

**Wesley Donaldson | 03:47**
Let's say what I'm doing is basically grabbing the existing Silquid diagram.

**Nicolas Berrogorry | 03:56**
Viewer that we have the...

**Wesley Donaldson | 03:57**
Viewer that we have the one that generates the visual diagram of the circuit and generating it instead of with custom gold with a Git Balser because I found that there might be differences between the circuit fertilizer which is heavily tested by them and basically the circuit code ST beta that we have.

**Nicolas Berrogorry | 03:59**
The one that generates the visual diagram on the circuit and generating it instead of with custom coal with the circuit visualizer.
Because I found that there might be differences between the circuit visualizer which is heavily tested by them and basically the circuit code ST beta that we have. It has better styles, but it may not match exactly what the circuit outputs.

**Wesley Donaldson | 04:19**
That is, it has better styles, but it may not match exactly what the circuit outputs.

**Nicolas Berrogorry | 04:25**
So what I'm trying to achieve today is without destroying the styles that don't have added and keep the circuit generated by circuit.

**Wesley Donaldson | 04:25**
So what I'm trying to achieve today is without destroying this time that we don't have and keep the circuit generated by circuit and that we make sure that anything that I do this week...

**Nicolas Berrogorry | 04:35**
That we will make sure that anything that I do this week, I am seeing the actual diagram of this circuit as accurately as possible.

**Wesley Donaldson | 04:38**
I am seeing the actual diagram of this circuit as accurately as possible and that is probably the first step into being able to test the multiple very different sequences to produce that battery of circuits.

**Nicolas Berrogorry | 04:45**
That is sort of like the first step into being able to test the multiple different circuits to produce that battery of circuits after that, I will proceed to adding those material circuits and see how they behave with a multilayer QMM that we already have.

**Wesley Donaldson | 04:59**
I will proceed to add those battery sequences and see how they behave with a multilayer QMM. Let me try that again. So we basically... Krisp, React Visualization, refactors call it okay because it's CIR okay, yeah, that's fine.

**Nicolas Berrogorry | 05:09**
Yeah, we can call it a Krisp kit e-squit renderer or something like that. Yeah, no.

**Wesley Donaldson | 05:32**
Again, I think my concern just let's get this off the board because it sounds like we've moved on.

**Nicolas Berrogorry | 05:38**
Yeah, it is necessary in order for me to trust the circuit... I need to see generated by Krisp.

**Wesley Donaldson | 05:40**
Necessary in order for me to trust the squid I need to see generated by Krisp. Okay. All right, go over to you.
Sorry. Do my apologies... Nicolas, are we done with this one? This was just converting the test to the pie test to start with that actually... Basically what I found is I have questions.

**Nicolas Berrogorry | 06:06**
Yeah, I forgot that I started the day with that. Actually, basically what I found is I have questions. Basically, I test does some actual testing running the LMS and all of that, or running actually Krisp and all of that for the tests.

**Wesley Donaldson | 06:14**
Basically and I test some actual testing running the LMS and all of that or running actually Krisp center of that for the tests.

**Nicolas Berrogorry | 06:23**
And my question would be.

**Wesley Donaldson | 06:23**
And my question would be.

**Nicolas Berrogorry | 06:26**
I saw that the Krisp test harness that you ratherom does a lot of mocking and basically validates the I/O and not necessarily run some deep testing.

**Wesley Donaldson | 06:26**
I saw that the Krisp test harness that you add on and that mocking and basically validate the IO and not necessarily run some deep testing.

**Nicolas Berrogorry | 06:42**
I don't know if we want to make that Krisp harness deeper or we want to keep some tests on the Python side.

**Wesley Donaldson | 06:42**
I don't know if we want to make that deeper or we want to keep some tests on the Python side.

**Nicolas Berrogorry | 06:51**
Like, should I migrate the Python test to a new tester harness at the cost of making it deeper and removing stars?

**Wesley Donaldson | 06:51**
Like, should I migrate the Python test to the new tester harness at the cost of making it deeper and removing stars? So I think that's... Don't own that work. We have direction from... That they use Python regularly.
So I don't think it's a block or... Plus, we had a task a month ago where we tried to convert the API from Python into TypeScript, and the direction that we received was "You're wasting your time."
So I think my question here would be, "Can we invoke the Python scripts from just...?" If the answer is no, then we should just leave it the way it is if we're losing functionality.

**Nicolas Berrogorry | 07:35**
Okay, for now, we have it, so no rollback.

**Wesley Donaldson | 07:37**
Okay, for now, we have it.
So no rollback. The still the best are still high value.

**Nicolas Berrogorry | 07:41**
The tests are still are in value. I will.

**Wesley Donaldson | 07:43**
I will see.

**Nicolas Berrogorry | 07:44**
If I can migrate them to... I think we can yeah.

**Wesley Donaldson | 07:48**
So can you time box that effort, please? This is behind the scenes, it's only mostly relevant for our effort. So I would say you and your favorite... Give it X number of hours, one or two, and that's it.
If the answer is "Yes, summarize it, and push it inside."

**Nicolas Berrogorry | 08:01**
One hour probably yeah, or less.

**Wesley Donaldson | 08:04**
I've done it, and just set the... What is the limitation that we have to live with after that one hour if it's just like we have to have two tests, it's fine.

**Nicolas Berrogorry | 08:12**
Okay, makes sense to me.

**Wesley Donaldson | 08:13**
Okay, sorry, Don, over to you.

**Dominik Lasek | 08:18**
Yes, so both of them are... We can say that they are done.

**Wesley Donaldson | 08:20**
Yeah, we can say that they're done.

**Dominik Lasek | 08:22**
I need to leave the comment.

**Wesley Donaldson | 08:22**
I need to leave the comment.

**Dominik Lasek | 08:24**
I should have done that on Friday, but yeah, I will do it.

**Wesley Donaldson | 08:24**
I should have done that on Friday, but I will do it. And I started talking with Xolv about a rug-based system.

**Dominik Lasek | 08:29**
I started talking with Rinor about the rug-based system, let's say, about the QMM prior look UPP, and so on.

**Wesley Donaldson | 08:36**
Let's say with the QMM prior look UPP and so on.

**Dominik Lasek | 08:41**
So that's gonna be my that is my next goal.

**Wesley Donaldson | 08:41**
So that's going to be my...

**Dominik Lasek | 08:45**
I think so, yeah.

**Wesley Donaldson | 08:46**
Yeah, if you can maybe spend some time on the write-up for that. I'd love to get Sam's perspective because my first thinking is that embedding works for related content, but I think it may lose the context of it's a circuit, right?
So I'm curious how we're actually going to do a rug for this. I'm aware of that.

**Nicolas Berrogorry | 09:01**
I'm...

**Dominik Lasek | 09:03**
Yeah, I'm aware of that, and that's a part of my conversation, but I will try to prepare something and give the answer on that.

**Wesley Donaldson | 09:05**
That's a part of my conversation. But yeah, I will try to prepare something and give the answer on that.

**Dominik Lasek | 09:12**
Yep. Actually, I have one concern.

**Wesley Donaldson | 09:13**
I have one concern.
I think that maybe we should, I don't know, somehow discuss those tickets with Jeff.

**Dominik Lasek | 09:18**
I think that maybe we should, I don't know, somehow discuss those tickets with Jeff.
For example, my concern is because, let's say, like, two weeks ago, we delivered something and he said that, you know, they don't want to get new, UI things on the demo and so on.

**Wesley Donaldson | 09:24**
For example, my concern is because let's say like two weeks ago we delivered something and he said that you know, they don't want to get new.

**Dominik Lasek | 09:40**
I'm not sure if that's the thing that they want us to work on.

**Wesley Donaldson | 09:40**
I know it's on the pipeline.

**Dominik Lasek | 09:44**
I know it's on the pipeline.

**Wesley Donaldson | 09:45**
So the QMM is mentioned in the pipeline in the document in the Jeff document.

**Dominik Lasek | 09:45**
So the QMM is mentioned in the pipeline in the document in the Jeff document.

**Wesley Donaldson | 09:50**
So maybe it is.

**Dominik Lasek | 09:50**
So maybe it is. But maybe it's a good idea to...

**Wesley Donaldson | 09:51**
But yeah, you're absolutely right.

**Dominik Lasek | 09:54**
To have a sign from them? I don't know.

**Wesley Donaldson | 09:58**
So let me take that as my responsibility. I'll outline the tickets that we have and I'll push that over to them in Slack just to say, "Hey, here are the things that we're prioritizing for this week. I'd love to maybe start doing that as part of the demo, like the last thing in demo, or maybe actually we have a plant, an architecture, and planning meeting. We'll do it as part of that meeting, but that session is on Thursday."
So it would have happened last week to inform this week. I'll have that in place for going forward in that Thursday meeting.

**Dominik Lasek | 10:28**
Okay. Okay, sure.

**Wesley Donaldson | 10:29**
For these two, I think my question would be, "Where is the how to live? Is it inside of a README somewhere inside of the project, right? Of how to actually use this system?" The reporting system.

**Dominik Lasek | 10:42**
I'm not sure. If there is any reading, I will take a look and I will create one if there is missing.

**Wesley Donaldson | 10:44**
I will take a look and I will create one if there is missing.

**Dominik Lasek | 10:48**
Yeah, I would love the comments as well here. So yeah.

**Wesley Donaldson | 10:50**
Perfect. All right, sounds like everyone is clear of the next couple of things that they're working on. Any questions, any uncertainty? There's always uncertainty, any critical uncertainty.

**Nicolas Berrogorry | 11:02**
The same uncertainty has come like the are we already done with the like the spike in exploration and investigation and like, sort of like grounding and am my goal to continue with the multilayer QM because if I do, I will have features to show on next Thursday.

**Wesley Donaldson | 11:04**
Like, are we already done with the like the spike in exploration and investigation and like, some of like grounding and. And am I good to continue with the NCLEAR QM because if I do, I wake up to features to show on next Thursday?

**Nicolas Berrogorry | 11:25**
So am I going to create a problem by bringing new features to the table?

**Wesley Donaldson | 11:25**
So by bringing your feature no.

**Nicolas Berrogorry | 11:32**
Basically, that question.

**Wesley Donaldson | 11:33**
So this was an explicit direction given to us. This was part of the Florian conversation.

**Nicolas Berrogorry | 11:34**
Okay. Yeah.

**Wesley Donaldson | 11:38**
This was part of just the larger steps of understanding where to apply Q and them within the circuit.
So I'm not worried about that. I think we can justify that.

**Nicolas Berrogorry | 11:46**
Okay.

**Wesley Donaldson | 11:47**
Fine. Similar with the work that Dam is going to pick up. Brian explicitly said it and Brian doesn't really get super emotional, but he was very clear that, "Hey, we haven't seen that kind of language he uses, so we can justify that."
So I wouldn't worry about that, let that be my problem.

**Nicolas Berrogorry | 12:04**
I like Brian's very grounded person.

**Wesley Donaldson | 12:05**
Yeah, very level-headed, not prone to a large emotional outbreak, even if done with a calm face.

**Nicolas Berrogorry | 12:10**
Yeah.

**Wesley Donaldson | 12:15**
Yeah. All right, guys. I think we're good to give everyone, like, a minute and change.

**Dominik Lasek | 12:18**
Yeah.

**Nicolas Berrogorry | 12:21**
Thank ye.

**Wesley Donaldson | 12:23**
And guys, bye for now.

**Dominik Lasek | 12:25**
Thanks, Maya.

**Wesley Donaldson | 12:25**
Thanks. By.

