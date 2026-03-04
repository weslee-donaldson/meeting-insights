# TQ, Internal - Mar, 03

# Transcript
**Nicolas Berrogorry | 00:01**
Clarify a bunch of stuff regarding the squid devaluation and all of that.

**Wesley Donaldson | 00:01**
Clarify on just stuff regarding the security evaluation and all of that.

**Nicolas Berrogorry | 00:06**
It revealed a lot more work to be done, but yeah.

**Wesley Donaldson | 00:06**
It agreed a lot more work to you. Yeah, he was polite, and he was more than polite, Dom.

**Dominik Lasek | 00:13**
He was polite.

**Nicolas Berrogorry | 00:14**
I' safe.

**Wesley Donaldson | 00:18**
He was actually like a partner. He felt like he was trying us to get to a solution together.

**Dominik Lasek | 00:24**
Yeah, actually, yeah.

**Wesley Donaldson | 00:32**
Sorry, apologies. My last one ran a little bit over as I shared in the channel really looking to get to a direction on what's the next chunk of work.
I have two epics built out that talk to just the idea of pivoting the architecture as well as going deeper. Once we have pivoted the architecture to a more modular and the idea that we can deep dive in each module and figure out specifically what we want or need to implement.
Then my bigger question to the team is just this idea of one, how much is enough? So this idea of refining every module to be perfect, to be exactly what they need. That's the job for when we get paid.
Sorry, when we have a larger team on the work and allow us to grow the feature set. So what is the minimum necessary to get us to the next decision point is one question I have. Then the larger question is just to get to that the pivot towards event sourcing. Sammy, do we think that's a rebuild? What Donald and Nicholas were talking about on the thread, is that a rebuild? Is it just enriching what we currently have?
But like what is our what's our direction or thought on that pathway for that?

**Sam Hatoum | 01:34**
We can have a pathway for that. But I think just more importantly now is just to keep working to prove that the value is being achieved.

**Wesley Donaldson | 01:36**
But I think just more importantly now, it's just to keep working to prove that the value is being achieved.

**Sam Hatoum | 01:43**
So yeah, I agree.

**Wesley Donaldson | 01:43**
So yeah, I agree that right now to keep pushing what we have.

**Sam Hatoum | 01:45**
Right now to keep pushing what we have. We've got the stuff going into the event store that's good.

**Wesley Donaldson | 01:47**
We've got the stock going into the event store.
That's good.

**Sam Hatoum | 01:51**
Then the next thing we need to make sure we've got is the ability to do the given when then scenarios or the assertions that I mentioned.

**Wesley Donaldson | 01:51**
Then the next thing we need to make sure we've got is the ability to do the given one then scenarios or these sessions that I mentioned.

**Sam Hatoum | 02:01**
So as long as we can do that, then nothing will be used.

**Wesley Donaldson | 02:01**
So as long as we can do that, then I think we'll be so... How far are we from assertions and start?

**Sam Hatoum | 02:05**
So how far are we from assertions? Let's start just the... Dominik.

**Wesley Donaldson | 02:12**
Do you get what I mean by socials?

**Sam Hatoum | 02:12**
Do you know what I mean by assertions?

**Wesley Donaldson | 02:14**
No, actually, I don't.

**Dominik Lasek | 02:14**
No, actually, I don't. Okay.

**Wesley Donaldson | 02:16**
Okay, so we've got going in right now, okay, you've got events being locked somewhere else.

**Sam Hatoum | 02:16**
So we've got the events going in right now. Well, okay, you've got events being logged somewhere now.

**Dominik Lasek | 02:23**
Yeah, I have yeah, I can show that.

**Wesley Donaldson | 02:23**
Yeah, I have yeah, I can show that.

**Dominik Lasek | 02:25**
Yeah, it actually works, it looks really similar to this what you have shown showed already with Auto.

**Wesley Donaldson | 02:25**
Yeah, it actually works, it looks really similar to this what you've shown showed already.

**Dominik Lasek | 02:32**
So great.

**Wesley Donaldson | 02:33**
Great.

**Sam Hatoum | 02:33**
Yeah, great.

**Wesley Donaldson | 02:33**
Great.

**Sam Hatoum | 02:34**
And then now if I send up one comment, I will see the resulting events.

**Wesley Donaldson | 02:34**
And then. Now if I send it one. Come on. I will see the resulting events.

**Dominik Lasek | 02:40**
No, it's not like that.

**Wesley Donaldson | 02:40**
No, it's not it's just it's not there's no commands.

**Dominik Lasek | 02:42**
It's just it's not there is no comment. There's like it's the same system as we have with the request and so on.

**Wesley Donaldson | 02:45**
There's like it's the same system as we have with the request and so on.

**Dominik Lasek | 02:49**
It's like the it's more like the, let's say debugger that actually uses the event store and emit events.

**Wesley Donaldson | 02:49**
It's like it's more like the, let's say debugger that actually uses the events for and emit events.

**Dominik Lasek | 02:56**
But...

**Wesley Donaldson | 02:56**
Yeah, well, again, it's very great that if I send a request, I'll see the events, you will see the... Can I share the screen?

**Sam Hatoum | 02:57**
Yeah, well, let me rephrase that if I send the request, I'll see the events.

**Dominik Lasek | 03:01**
You will see the... Can I share the screen? That's gonna be...

**Wesley Donaldson | 03:04**
That's gonna be...

**Dominik Lasek | 03:09**
So yeah, I have already created this one, so we don't have to worry about that.

**Wesley Donaldson | 03:09**
So yeah, I have already created this one, so we don't have to worry about that.

**Dominik Lasek | 03:14**
But there is an event.

**Wesley Donaldson | 03:14**
But there is a even so we have something like that which actually the last like the pipe execution started no execution started.

**Dominik Lasek | 03:15**
So we have something like that which actually tells us like the pipeline execution started, node execution started. There are some input/output, for example, circuit input, which is the node output produced.

**Wesley Donaldson | 03:21**
There are some input/output, for example, circuit input which is the node output produced.

**Dominik Lasek | 03:27**
There is the output.

**Wesley Donaldson | 03:27**
There is a there is the output node execution completed something more interesting like Brian Producer there is the output.

**Dominik Lasek | 03:29**
Node execution completed, something more interesting like variant producer. There is the output.
So yeah, it looks like that, but I cannot say it's like the event-driven application, it's more like...

**Wesley Donaldson | 03:37**
So yeah, it proves like that, but I cannot say it's even a new application. It's more like... In order to get to these events,

**Sam Hatoum | 03:43**
I got you. So. Okay, in order to trigger to get to these events. Am I calling like, what's the trigger to get those events?

**Wesley Donaldson | 03:48**
Am I calling like what's the trigger to?

**Dominik Lasek | 03:53**
And the trigger is like the run pipeline.

**Wesley Donaldson | 03:53**
The trigger is it runs in the API so we have the events in the data and when we create a pipeline and actually they create pipeline, let me show you, just like, for example, this one.

**Nicolas Berrogorry | 03:56**
And it's it runs in the API now actually gives the so we have the.

**Dominik Lasek | 04:06**
We have the events in the data and when we run... When we create the pipeline. And actually, the create pipeline now... Let me show you. Just like, for example, this one, I'm not sure. Okay, it appears here.

**Wesley Donaldson | 04:23**
Okay, so yeah, if we... It's created each time we do something when we create a new pipeline.

**Dominik Lasek | 04:25**
So yeah, it's created each time we do something when we create a new pipeline, we create a pipeline created, and we add some nodes so we know configured events have happened.

**Wesley Donaldson | 04:30**
We created ag pipeline CR we have some nodes so we know configure event so like each event is a system produces event so that's so any action on the systems producing ever.

**Dominik Lasek | 04:38**
So, like, each event in the system produces events.
So that's what they said.

**Sam Hatoum | 04:44**
Okay, so any action on a system is producing an event. Yeah, okay, that action is a command.

**Wesley Donaldson | 04:51**
Yes, okay, but action is a command.
I know.

**Dominik Lasek | 04:56**
I know, but okay, it is a command, but it's not the command as we had in the... For example, in the system.

**Wesley Donaldson | 04:59**
Okay, it is a command, but it's not the command that we had in the...

**Dominik Lasek | 05:04**
But yeah, you're right.

**Sam Hatoum | 05:06**
The definition of a command is actually if you go to a higher level, if we got a higher level of commands.

**Wesley Donaldson | 05:06**
The definition of a command is actually, if you go to a higher level, we've got a high level of commands. Events and state are all types of messages.

**Sam Hatoum | 05:15**
Events and state are all types of messages, all right, so ultimately it's messages, right?

**Wesley Donaldson | 05:21**
So ultimately it's messages.

**Sam Hatoum | 05:23**
So we have a message going into the system, which is we call it action or request or command.

**Wesley Donaldson | 05:23**
So we have a message going into the system which is equally action, request, or command.

**Sam Hatoum | 05:27**
That's a message because it's just load data, and that's the message for the process to run to then produce another message, which in this case, we're recording events.

**Wesley Donaldson | 05:27**
That's the message. It's just data. That's the message for the process to run to then produce another message, which in this case, we're recording just want you to get that mental framework.

**Sam Hatoum | 05:36**
I just want you to get that mental framework around it, right? Messages in, messages out, a message going in.

**Wesley Donaldson | 05:38**
Messages in, messages that a message going in, what is action on the systems and action will come on to do this, right?

**Sam Hatoum | 05:41**
When it's action on the system, it's an action or a command to do this, right? A request is it doing right?

**Wesley Donaldson | 05:46**
A request is a blueting, right?

**Sam Hatoum | 05:48**
Then the event is the response or the event is the output or the event, right?

**Wesley Donaldson | 05:48**
Then the event is the response or the event is... Yeah. Or the event.

**Sam Hatoum | 05:52**
Like that's. I just want to like when I talk about these terms, when we talk about them together, that's what we're talking about now.

**Wesley Donaldson | 05:52**
I just want to... When I talk about these terms, when we talk about them together, that's what we're talking about now.

**Sam Hatoum | 05:57**
We could go full on event sourcing, but that's... I know you're thinking commanding the event sourcing space.

**Wesley Donaldson | 05:57**
We could go full on events, but that's... I like how you're thinking commodity events... But have to be that it can still be a slow but source income, which is what we're doing.

**Sam Hatoum | 06:02**
It doesn't have to be that. It can still be a pseudo event sourcing command, which is what we're doing here.
Okay, all right, so now if we go back to the original statement of, like, can we have... Stick given when that can I isolate a single module and run just that one module, which I should be able to do in a GK in given.

**Wesley Donaldson | 06:08**
All right. So now if we go back to the original statements like "Can we have state given where that...?" Can I isolate a single module and run just that one module, which I should be able to do in a given window?

**Sam Hatoum | 06:22**
We then test if I open up that module, tell that it's emitting an event, if I open it, if I load it into memory into a given one, then test like a Jest test or you can use Jest.

**Wesley Donaldson | 06:23**
Test.
If I open up that module, that's the event. If I open it up, if I load it into memory into a given one, then test like a Jest test or you use...

**Sam Hatoum | 06:32**
That's fine.

**Wesley Donaldson | 06:32**
That's fine, use just Jest.

**Sam Hatoum | 06:32**
You use GG WT. It doesn't have to be cucumber. In fact, please use Jes G wt.

**Wesley Donaldson | 06:35**
In fact, please use GGW te right?

**Sam Hatoum | 06:37**
Right.

**Wesley Donaldson | 06:38**
So if I load it ingest right, I load that one module, be that fast compression or any of those one modules, and I send in a request into that module.

**Sam Hatoum | 06:38**
So if I load it in Jest right, I just load that one module, be that stochastic compression or any of those one modules, and I send in a request into that module. I would expect then the events to come out the other side, right?

**Wesley Donaldson | 06:48**
I would expect then the events to come out on the website, but that is the test point that now we can connect any module into, and we can create proof that module is working.

**Sam Hatoum | 06:53**
That is the test harness. Okay, that now we can connect any module into, and we can create proof that module is working by. What should they...?

**Dominik Lasek | 07:05**
And what should they understand? There's somedule.

**Sam Hatoum | 07:09**
Any of the things that currently run in the pipeline.

**Wesley Donaldson | 07:09**
Any of the things that can be done in the pipeline, like the visual but running on the server isolated.

**Sam Hatoum | 07:11**
Like the visual, but running on the server.

**Nicolas Berrogorry | 07:14**
Isolated like ideally we currently do have that level of isolation.

**Wesley Donaldson | 07:20**
But we currently do have that layer of isolation.

**Nicolas Berrogorry | 07:23**
That's why I mentioned that I think it's pretty close to an event-driven.

**Wesley Donaldson | 07:23**
That's why I mentioned that. I think it's pretty close to... As like the least bit by bit.

**Nicolas Berrogorry | 07:27**
Even though it's not like...

**Sam Hatoum | 07:29**
There we can react to the things bit by bit.

**Wesley Donaldson | 07:30**
I don't...

**Sam Hatoum | 07:31**
I mean, we have a there's a progression we can get to from prototype disability for sure, right?

**Wesley Donaldson | 07:31**
I mean, we have a there's a progression we can get to from pics for sure, but I think you have already decided.

**Sam Hatoum | 07:35**
I think you've already started laying the grounds, but don't...

**Wesley Donaldson | 07:37**
So I want to make sure what is for the place, if I understand you correctly, if I'm looking at your pipeline on screen, go back to a job, show me a job in the pipeline again.

**Sam Hatoum | 07:37**
I just want to make sure we've got this fully.
If I'm understanding correctly, if I'm looking at your pipeline on the screen, go back to a job. Show me a job in the pipeline again. I remember we showed that there was some UI early jobs.

**Wesley Donaldson | 07:46**
I remember we showed that there was some UI geography.

**Sam Hatoum | 07:49**
Okay, so if I look at that one circuit input, that's purely a UI concern, right?

**Wesley Donaldson | 07:49**
So if I look at that one circuit input, that's purely white in some... It sent a secret to the...

**Nicolas Berrogorry | 07:57**
Well. Sorry. It send. It sends the secret to the account for valiation.

**Wesley Donaldson | 07:59**
For validation work, that is called...

**Nicolas Berrogorry | 08:01**
A worker that is called Vaqui.

**Wesley Donaldson | 08:04**
So that as a form builder, as a data connector that sends in a request that's in common.

**Sam Hatoum | 08:04**
So think of that as a form builder, as a data collector that sends in a request that's in a command. So it's not actually... It's just purely front-end.

**Wesley Donaldson | 08:08**
So it's not actually it's just purely function it data and send they come on that Comman goes into V in producing our very in producer I expect to run the s right so that the last question is on varying producer would be a module.

**Sam Hatoum | 08:10**
Command goes into the variant producer. So it collects data and it sends in a command. That command goes into the variant producer and a variant producer I'd expect to run on the server, right?
So to answer your question earlier, don't variant producers would be a module? That's what I'm referring to as a module parameter optimizer that runs on the server, right?

**Wesley Donaldson | 08:22**
That's what I'm referring to. The model, right? The optimizer that runs on the server, it takes an input, runs a process, and produces an output.

**Sam Hatoum | 08:26**
It takes an input, runs a process, and produces an output.
So all things that take inputs, right, process them, and produce an output.

**Wesley Donaldson | 08:30**
So all things that take inputs, right, process them, and produce an output.

**Sam Hatoum | 08:36**
All of those are modules.

**Wesley Donaldson | 08:36**
All of those are modules. All look for every single one of those modules we need a test as that uses a given.

**Sam Hatoum | 08:38**
For every single one of those modules, we need a test harness that uses the given when then approach.

**Wesley Donaldson | 08:43**
We then approach.
Okay.

**Sam Hatoum | 08:48**
Okay, and so it says and we don't have to actually Givens is probably not relevant right now.

**Wesley Donaldson | 08:49**
We don't have to actually give us a for right now. This is when then because what you're going to do is say, "I'm going to load this parameter." So parameter to my all over, I'm going to say, "When comes on, let it run."

**Sam Hatoum | 08:53**
It's just when then, because what you're going to do is say, "I'm going to load this circuit parameter. So I'm going to load this circuit parameter optimize or whatever. I'm going to say when command, let it run. Then I at the end, when it's run, I'm going to load up all the events and assert that all the events were as I expected.

**Wesley Donaldson | 09:05**
Then I at the end, when it is one, I'm going to load up all events and assert that all units were as I expected.

**Dominik Lasek | 09:14**
Okay.

**Wesley Donaldson | 09:14**
Okay?

**Sam Hatoum | 09:15**
It's a test hardness, right?

**Wesley Donaldson | 09:15**
It's a test policy, right?

**Sam Hatoum | 09:17**
Now we have a general purpose way of doing test harnesses around everything that is commanded events.

**Wesley Donaldson | 09:17**
Now we have a terrible purpose way to mean test part to say that around everything that is commanded events.

**Sam Hatoum | 09:22**
We can show proof right in a test report.

**Wesley Donaldson | 09:22**
We can show proof right in a test report.

**Sam Hatoum | 09:26**
These are the modules running in isolation.

**Wesley Donaldson | 09:26**
These are the models running in isolation, and here's proof of what they do.

**Sam Hatoum | 09:28**
Here's the proof of what they do. Is this what you expect?

**Wesley Donaldson | 09:29**
Is this what you expect? You'd like to modify in these models?

**Sam Hatoum | 09:30**
Would you like to modify any of these modules?

**Wesley Donaldson | 09:36**
It's hard to say, to be honest, because it's like the...

**Dominik Lasek | 09:37**
It's hard to say, to be honest, because it's like the... I wasn't looking at this like that.

**Wesley Donaldson | 09:40**
I wasn't looking at this like that.

**Dominik Lasek | 09:43**
I just added, you know, the I just added, like, the events to each com.

**Wesley Donaldson | 09:43**
I just added the I just added, like, the events to each com.

**Dominik Lasek | 09:51**
Yeah, to each command, actually.

**Wesley Donaldson | 09:51**
Yeah, to each command actually.

**Dominik Lasek | 09:52**
But...

**Wesley Donaldson | 09:52**
But, you can actually do the test around those events.

**Nicolas Berrogorry | 09:55**
You can. You can actually do the test harness around those events. Basically, the assertions would check if a specific event was produced after sending that initial event to a module.

**Wesley Donaldson | 10:00**
Basically, the assertions would check if a specific event was produced after sending that initial event into a module.

**Nicolas Berrogorry | 10:09**
The other thing that I wanted to say is that we already have tests so that there is a little bit of testing already done that could be centralized into a single harness that basically tests... It's more like an integration test, right?

**Wesley Donaldson | 10:09**
The other thing I wanted to say is that we already have tests so that there is a little bit of testing already done that could be centralized into a single harness that basically tests... It's more like an integration test, right?

**Nicolas Berrogorry | 10:25**
Because you need the modules to be up and running, and it could go in the API, for example, if you add a Stripe-based test on the API, we could delete the test that we have for the Python workers.

**Wesley Donaldson | 10:25**
Because maybe in the morning you fail, and it could go in the API, for example, if you have a stateless-based test on the API because the test doesn't for the Python.

**Nicolas Berrogorry | 10:40**
Yeah.

**Sam Hatoum | 10:41**
So look, I mean, you might need some extra help on this one.

**Wesley Donaldson | 10:42**
So look, I mean, you might need some extra help on this one.
So I'm happy to do it with this plan in the next few days, but I want to make sure I find the time to help you.

**Sam Hatoum | 10:45**
I'm happy to do it. I'm a bit slammed the next few days, but I want to make sure I find the time to help you. But ultimately, we're just trying to isolate each one of these modules into a single input-output system where you can send in a command or request an action.

**Wesley Donaldson | 10:50**
But ultimately, like, we're trying to isolate each one of these modules into a single like. Info Apple system where you can send in a command or request an action.

**Sam Hatoum | 11:01**
It does the action.

**Wesley Donaldson | 11:01**
It does the action.

**Sam Hatoum | 11:02**
It's logging events using the thing.

**Wesley Donaldson | 11:02**
It's logging events using the in-use built.

**Sam Hatoum | 11:04**
You just built. Now it's logging events somewhere to disk or whatever.

**Wesley Donaldson | 11:05**
Now it's logging than some of it is or whatever.

**Sam Hatoum | 11:07**
And at the end we load them all up and just go through them and say, you know, expect that each event to have happened in this order with these values, right?

**Wesley Donaldson | 11:07**
At the end, we load them all up. We just go through them and say, "Expect each event to happen in this order with these values, right?"

**Sam Hatoum | 11:15**
That's enough.

**Wesley Donaldson | 11:15**
That's enough.

**Sam Hatoum | 11:16**
That's like...
Don't overcomplicate this.

**Wesley Donaldson | 11:17**
That's all we're looking for.

**Sam Hatoum | 11:17**
That's all we're looking for here.

**Dominik Lasek | 11:19**
Okay.

**Sam Hatoum | 11:20**
So for example, the circuit one, right? We'd say input.

**Wesley Donaldson | 11:20**
So for example, the circuit one, right? We say input as I go in the test run circuit like simulate press the same simulating.

**Sam Hatoum | 11:24**
That's right, even the Krisp run circuit like simulate. I let's say the simulate. In my test, I would say "import simulate module".

**Wesley Donaldson | 11:30**
In my test, I would say "import simulate module" and "import simulate".

**Sam Hatoum | 11:34**
I'd import the simulate. I would fire a command into it that gives it the, you know, the same command which basically Says here's the circuit, here's the parameters, is everything.

**Wesley Donaldson | 11:36**
I would fire a command into it that gives it the same command space because it so hit... Everything went wrong.

**Sam Hatoum | 11:42**
Run it finishes the run at the end.

**Wesley Donaldson | 11:43**
It finishes the run at the end.

**Sam Hatoum | 11:44**
There's a bunch of events.

**Wesley Donaldson | 11:44**
There's a bunch of events.

**Sam Hatoum | 11:45**
I load all those events from somewhere, and then I say, "Expect event zero to be this, expect event one to be that, expect event two to be that."

**Wesley Donaldson | 11:45**
I load all those events from someone, and then I say, "Expect event zero to be this, expect event one to be that, expect event two to be that."

**Sam Hatoum | 11:52**
That's it.

**Wesley Donaldson | 11:52**
That's it.

**Sam Hatoum | 11:52**
That's all I'm talking about.

**Wesley Donaldson | 11:52**
That's what I'm talking about.

**Dominik Lasek | 11:54**
Okay.

**Wesley Donaldson | 11:54**
Okay and where like in the US I thought those right and then it produces the Jess report that he ends right get to a came I reported with Jess and then let's just look at that report and should well I won't be at the next call in if they like you said set up another session.

**Dominik Lasek | 11:54**
And this one should be triggered where like in the UI.

**Sam Hatoum | 12:02**
For example. No. A PM test like this is just a camp pulls locally, that's all that is, right? And then it produces a Jes report at the end, right? Get it to. I reported with Jes and then let's just look at that report. It should show everything inside it, whereas I can't be at the next call. Pull me in, please, if they need me, like, just say, set up another session if ever.
Like, I know there's some commotion going on with LS if I'm needed, just set up another session for me, please. End the day.

**Wesley Donaldson | 12:28**
I'll send you a Slack. So there's one thing currently regarding the current that you should be aware of. But I got a drop here, you say? Okay, perfect.

**Sam Hatoum | 12:36**
By the way, guys. So just... If you can focus.

