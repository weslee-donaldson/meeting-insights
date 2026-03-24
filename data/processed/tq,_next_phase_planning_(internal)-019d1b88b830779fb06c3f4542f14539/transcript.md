# TQ, Next Phase Planning (Internal) - Mar, 23

# Transcript
**Wesley Donaldson | 00:07**
Good morning, gentlemen. Again. Afternoon.

**Sam Hatoum | 00:15**
That's enough.

**Wesley Donaldson | 00:17**
Discard. I did have a chance to connect with Sam, so he's aware of this and he will be joining us. Just give him a couple of minutes.
How is it? No.
Sorry, Sam. I'm happy to do a quick intro here, but the goal of this session was more just an opportunity for you to share thoughts from the... We've had a few architecture and round table sessions. Some common themes are showing up there, but it sounded like you had a strong perspective on things that you wanted to maybe tackle.
Kind of like the next phase of work for the engineering team. I can remind you of some of the things we heard during the call.
Can you hear us?

**Sam Hatoum | 03:13**
Yes. Can you hear me?

**Wesley Donaldson | 03:15**
Yep, you're okay.

**Sam Hatoum | 03:17**
Please, go ahead.

**Wesley Donaldson | 03:19**
So one of the big things that was a point of conversation was around orchestration. It felt like there's an opportunity there for us to use what's on auto to revamp our orchestration process or how we are running a pipeline. There was conversation around how we can maybe demonstrate a longer running pipeline or a more complex pipeline.

**Sam Hatoum | 03:32**
He.

**Wesley Donaldson | 03:40**
There was conversation around their internal orchestration efforts that they had an ML team. One of the core offerings that they had was just like they'd built up supposedly built a platform that is centered around orchestration.
We were trying to see if we can get access to that and maybe help them provide a bit of a recommendation or an audit, for lack of a better word, on what they have already created. We talked a little bit about what additional MCP offerings we can actually bring to bear within the experience if this is connecting additional MCP services. We spoke about event sourcing as just a pattern generally, how we can better demonstrate how the system is set up for this future expansion by virtue of event sourcing as an architectural pattern. There's some general stuff that they talked about if we can do some data processing as I make an intro step.
But we mentioned the Florian circuit experiment multiple times. I think the team already has a ticket on the board for actually running that and just closing out the loop on that. So the orchestration is the thing that came up most often in the last couple of weeks in conversation.

**Sam Hatoum | 04:54**
All right, thank you for filling in the context. Like a Claude session right? Spec on how we work as humans now. Jesus Christ. All right, so happy Monday festival. Next thing is, I think for how we do this or what we're doing, we definitely want to use LLaMA's experiment as the basis.
So let's just quickly talk about what that is, and then we're going to talk about how we're going to achieve it. The experiment is something along these lines. It doesn't matter what circuit you bring, because if you run that circuit a thousand times, you will get some kind of distribution where, let's say, 600 times out of the thousand you get the same result, right?
The actual when the circuit collapses, you get a result, but 40% of the time you get basically noise. It's random. It's just so... It's not the same result. The key is to get a quantum circuit to be more and more consistent.
Obviously, the goal is 100%, but it's cheaper. QM is a means for reducing that loss. Or it's a way of increasing the reliability. So far, so good. A simple experiment is this. We want to vary the circuit, and we want to see if we can increase that from 600 to 700.
From 700 to 800. Like every time we get it out of a thousand results, every time we get an improvement, and we know that's a good... That's a better circuit than a previous one. Sorry, that's a better error correction than a previous one. This is the simple experiment. Now what does the variance look like?
Well, you can put QMM after certain things. I can't remember exactly what he said, but there are specific nodes, and usually, it goes after them. But then I was saying, "Okay, can we vary the core?" And then he was like, "That's super interesting, maybe we can put it before." I didn't think of them anyway. There are a bunch of variations that we can do. Now, the problem is this, right?
This is where I need your full brain power. Now, are you ready? The problem is this. It's if we're going to run a million different experiments at the same time, how do we collect the results?

**Wesley Donaldson | 07:06**
Of...

**Sam Hatoum | 07:11**
Effectively.

**Nicolas Berrogorry | 07:15**
This is select or collect.

**Sam Hatoum | 07:21**
I mean, a bit like what I'm saying is, "Let's say I want to write a few different strategies for variance." One is a genetic algorithm strategy. One is just a randomized strategy. So randomized just means trying a bunch of random stuff and seeing what sticks.
So it's basically the equivalent of throwing things at the wall and seeing what sticks. That's just a random approach, right? Randomized. That looks good to store it randomized, right? Keep randomizing.
I think that doesn't steer you in the right direction. That's just random. That's a single point going in every single direction. That's not ideal. The next one will be more like a genetic algorithm where it says, "Okay, I'm going to put out this very variety, and I'm going to test it, and I'm going to create twelve variations of it." This variation looks good.
That's promising. That's promising. Let's go to that one invariate. Let's go to that one invaria, right? That's more like a genetic algorithm, and it starts to trace down apart. There's.

**Nicolas Berrogorry | 08:21**
Pros. Random test, select, store, resume, modify, and exactly... Yeah.

**Sam Hatoum | 08:31**
Now imagine orchestrating a million of these. No one's going to sit there running that vitamin, but that's TED. But a genetic algorithm would do that. If we design an orchestration algorithm that can do that now we can just let it loose. We can put what are the variation parameters that it can do?
We get an evolutionary... We can basically evolve the right mechanism, right? Fun stuff, right? [Laughter] So how do we...? So there's not really much experimentation infrastructure here.
Ultimately, what we're building is experimentation infrastructure. Infrastructure is what it is. But then if you think about actually what it is, it's a pipeline orchestration abstractly, it's just a pipeline orchestration.
Whether that's running experiments, whether that's running agentic workloads, right? Whatever that's doing, it's the same sort of thing. It's basically an input-output module with a feedback loop, which is basically a program. A module.
If you just think about it all in terms of the module stuff that we've been thinking about, it's a configuration of a set of modules, right? In a certain way. So there's going to be a bunch of features that we need from the... One of them is going to be when... Very simple when this happens they'll do that most events like Node has it built in emit and you know like the event emit.
But then we go into a bit further. Now we say, okay, well, there's more higher order functions that you need in this pipeline configuration. One of those higher order functions, for example, is scatter gather. Oddly enough, I don't see many algorithms.
I've looked everywhere for pipelines that can do scatter gather and they're just not around. It's like, "Are people just not doing it?" I invent scatter-gather. I don't think I did because it's a concept that existed in reality, but...
So anyway, I just haven't found any pipelines that do scatter-gather. Just to say what scatter-gather is, I say, "Okay, here's a job. So here are 20 jobs. Run them and then gather the results for more than for..."
But I need that as an abstract constructable. So imagine you have a reducer, right? We have a reducer. You basically say, "Is my function, is my predicate, is my function, whatever?" Here's the stuff I want to do and I run it.
That's a high-order function. A reducer is a high-order function. I want to scatter-gather higher-order functions. Now we built that for auto the pipeline and auto supports the scatter-gather function. Let me show it to you.
So far... Go to... Actually, you guys will have a quit laugh first. So let's laugh and have something first. Let's see if this post on LinkedIn the even post the should of... No love these days. I wasn't posted the... What?
March 23, 09:07 PM. I'll just launch it now. Post ready for this.

**Speaker 4 | 12:02**
When we're chest the script.

**Sam Hatoum | 12:04**
This is when you give AI control over your architecture. Can you hear it? The cassette.

**Speaker 4 | 12:11**
The cassette goes into Starro's workshop where just a scream is channeled through Black Bull's mouth, forming a sunny cannon powered by an arc reactor that is extracting energy from a quantum black hole. The reactor is supercharging the proton pack where it merges with atomic radiation from a Godzilla embryo that is life sustained by pure testosterone from Chuck Norris. The fusion is channeled through Go's hands into a Khyber crystal, forming a laser focused atomic dark matter.
Okay.

**Wesley Donaldson | 12:47**
I'm enjoying that.

**Sam Hatoum | 12:49**
I saw that video. I was like, "That's what architecture looks like where you just give it to AI."

**Nicolas Berrogorry | 12:55**
Talking about like word sales worth sale.

**Sam Hatoum | 13:03**
Anyway, that video... Maybe it cracked up. I'll send you the... It's in the random... It's in Asana random if you want to see the pull one, it cracked me up. Okay, sorry, back to the point. I'm glad I saw that because otherwise, I wouldn't have known that he didn't post.
So if I just go to "On auto" here, and I go to "Examples," typical... This is the auto pipeline, and the auto pipeline works for anything right now. It doesn't have to be for log-based workloads. You can just basically get this package... It's in here, it's in the auto engineer pipeline. See that right there?
That's what we have. So we have a bunch of stuff we're putting out the pipeline, one of them is defined. So you define a pipeline, give it a name, and you say "On this, do that." It has a bunch of support built in already for things.
It has this here... Once all of these are settled, basically all of these here. So here we're saying "Check test checks." We're firing these. So it says "One in a moment implemented, then emit these events." This is effectively the scatter.
Then what we say here is "On all of these settled," which means we can now gather, then dispatch this. So this is a scatter gather, right? I could say I'm going to emit all the stuff, and once it's all done, I'm going to get the settlement.
Now that I've got the settlement, I can do some logic in here, which is basically saying if we have an error in any of these, then retry. I can actually put a block of code in. So that's what I mean. We have a pipeline already, right, that I created, and it's an event source pipeline actually under the hood. This is using EMET, right, and is storing everything it's commands and events.
So what we do if we wanted to test this out, and I'd like for one of you to do that. We basically have the plugins, and instead of these auto-engineer plugins, they become the components that we've been building, right?
So for TQ, this might be QM, like ter-quantum QMan at circuit variation and all of that. All right? The nice thing about this is if I go to the local house 5555, just simply by configuring the pipeline, you basically get a diagram for free, right?
So this is how the holder water was built, right? So there you go. This is basically a diagram that we can immediately see from that. There's this check test, check type, and check in, and they basically all come back in here with that retry you. You don't have to do anything to get visual, to get the visual, all right?
That's actually what's happening under the hood. So I have a pipeline as a point, and it's open source. It's in the auto-engineer. I've already and I will it. So I think it's a worthy experiment to say, "Okay, if we're going to run this experiment for Florian on a large scale, this is a great starting point." We just basically say, "Look, let's fire this. Let's get an experiment where we have a Krisp plugin, we have a quantum QMM plugin, we have a block plugin, and a circuit editor plugin. Everything we've done so far just move it into here has plugins. Figure out the plugin architecture."
It's not hard like it's over.

**Wesley Donaldson | 15:59**
I think the intimate that...

**Sam Hatoum | 16:00**
Here is show the plug in architecture. One moment like, let's just have a look at this, for example, as server implemented, right, let me go look at that. So if I go to packages server implemented down here source commands like this is it like implement server for example, it's a it takes a bunch of commands. One command implements server command. It has a set of events that it publishes. It succeeded or failed with a payload.
Then I define my command handler. Well, basically, I just say "define command handler" and I give it a bunch of parameters, and this is what ends up making it all visible on the pipeline. I have some logic inside it.
It's really not hard.

**Nicolas Berrogorry | 16:40**
It's beautiful. Thi this is this insane. Like I took my time to study CQ S and I went sourcing, from theory recently. And luckily I did that because now I can follow everything that you're sharing.

**Sam Hatoum | 16:54**
And now we can go to messages and you can see all of the messages here. Pipeline started. This is the command that was triggered. Here's the correlation ID, here's the initialized server command. And then over here we have events in here like, let me go look at what failed or nothing failed.
That's nice because I guess it's just initialization at this point. But the point is, I can actually go and see every single message that happened. And you know, yeah, it's all in here.

**Nicolas Berrogorry | 17:20**
This is crazy.

**Speaker 5 | 17:21**
Well. Question I have those events though that you showed as on the Jason file, those comes from the pipeline package or from something else that in our case it they will come from the from our pipeline from our.

**Sam Hatoum | 17:39**
Yeah, exactly. These are modules right here. They set up all these commands over here that I can send. I can send any of these commands with a payload like "initialized server round." Right? So there is a destination dot and then over here it says "server initialized." That's the matching event to that one. You can see the request ID matches and the correlation ID is all part of the startup.
So there was an initial startup session in a pipeline started over here and at the very end, you can see "pipeline ended." And so this is all part of the same... We have a session, and over here there's a correlation which basically carries through them when you have to do a run.
So you got request ID and correlation ID. You can add sub-IDs if you want so that you can trace sub-traces. These are traces affecting this request is always from this to this. So you can see these match, you can see these match, and you can see this one here. Pipeline runs started to complete.
That's a bit weird that that's different, but anyway, you can see the matching up, right? Yeah, I mean, I can show you. I just built a back end right like a beta trigger. So now you can see down here all these guys kicking off.
Now it's running the scatter. This is now scattering all of those. You can get concurrency and built a lot into this.

**Nicolas Berrogorry | 18:45**
But this is for what exactly is this doing and how do we compare the pipeline so the pipeline you're showing us is actually building stuff.

**Sam Hatoum | 18:53**
Right? Building code, correct, but you just do this to run experiments, right? So this might be like you initialized an experiment, the next one might be a job here, which is very circuit, right? Then this is very circuit sorry, running this instead of implementing moment, this might be executing an experiment, right?
So you're saying...

**Nicolas Berrogorry | 19:08**
That the abstractions that you build to create ODO can be recycled to implement anything because it's basically secure or S or M basically exactly. Advers command state.

**Sam Hatoum | 19:24**
Command state command event, and then we build up state. That state is actually like the pipeline view is a state.

**Nicolas Berrogorry | 19:30**
Do we want to bring... Yeah, do we want to bring... Because they would have two layers, one layer, we could use auto to create this, and at the same time, this will have some parts of auto in it, like the abstractions.
But what do you want to. What do you want? Which steps do you want us to take? For example, do you want us to create one package that is the auto API that is how it is built? For example, imagine that we create one package next to what we have and ask Claude, "See our ESCCE API. We have a one API that is a central hub.
Can you reimplement that one using auto, for example?"

**Sam Hatoum | 20:18**
Yeah. Look, this pipeline here shouldn't theoretically be abstract. I actually don't know if we even need a message bus or file store in here. So I think the first thing I would do is take this pipeline, rip it out, it's open source, it's only the auto engineer. Rip it out. Remove these two dependencies so that it doesn't need them. I don't think it needs them.
I think this guy has its own message bus. If it is the message bus, the problem, take it with you. It's a very tiny package if that's all it is, but... So if we just need... By the way, these are published like this. Auto engineer if I go to NPM, all of this stuff is published.
So actually what you can do is you can just import any of them or to engineer up there and just look at that link here. I think it's just cold like... There it is, right? This is it. You can actually just pull this package right now, and it'll pull everything it needs, right?
Then you can start to work with it like this. So I think that's just the first thing. Put it as it is, let it pull whatever it wants. It should just work, right? Then that way if you want... I think that's the easiest thing because it's an isolated package, and the code that we need to evolve that package lives in auto.
So if you want to add a new function to enable new some new pipeline functionality that the experiment needs, you can push that into auto, no problem. Like we can work together and that's just extra pipeline functionality.
It's useful.

**Nicolas Berrogorry | 21:40**
Cool. Okay, so basically auto like you have this sort of like abstract pipeline definition for secure systems, we can definitely use it to model what we have right now. Do we want to model what we have right now or only do the isolated experiment of genetic the genetic loop?

**Sam Hatoum | 22:02**
No, I think so. What I'm saying is, I think this is so... Yeah, I'm glad you asked the question. There are multiple experiments we need to run. The first one is can we just use the auto engineer pipeline?
Right? Which is what I just spoke about. I think if you wanted to do that, the way to do that is you can look at two things. If I go to auto engineer over here and have a look at examples typical and auto copy, I'll share that right now.
I'll put it in this... You can put it in the slide, but basically that... Here is an example pipeline configuration plus this package. All right, so if I just go back to that package that we had earlier, the combination of these two things I just said that allow you to get the pipeline package and then write your own plugin.
Okay? Write your own plugin, which is simply going to be, let's just say run Krisp, create circuit, run. I don't like come up with something where we take our current pipeline jobs, move and migrate them into here, write them as a plug.

**Nicolas Berrogorry | 23:06**
Is it a separate repo or do we keep it side by side in the same repo?

**Sam Hatoum | 23:11**
Put it in a directory as an experiment one, experiment two. It doesn't matter.

**Nicolas Berrogorry | 23:16**
We have, I think... Don't confut it as different packages in the packages folder. It's not one for this.

**Sam Hatoum | 23:23**
So where? I'll get to you in just a second as soon as we move on to the part two of the experiment. So that's experiment one. Experiment two is that someone needs to go and look at another alternative, but doing the same thing here, maybe using something like Master that can do for us.
Another way would be looking at the Google ADK, which is the agent development. Maybe there's something I'm missing altogether, like what other orchestration exists out there that allows us to do this? Auto is one thing that I know well.
Right? It's one experiment, and we should see if we can implement Florian's experiment using auto the auto-pipet. Can we implement Florence's experiment using Master? Can we do it using the ADK? Can we do it using... Is this something I've missed?
So there are a variety of agentic things that can do it, and we just want to come back to this. This is the experiment read, so both of you can go work on alternatives like different ones to go experiment with and bring back results.

**Speaker 5 | 24:19**
Yeah, I have a question. Let me speak my mind. So what I see here is actually we have a system right now, the pipeline, and we have some modules there, but we need to somehow adjust those modules to be handled by the pipeline that you showed. Is it correct?

**Sam Hatoum | 24:37**
Yes, exactly. Okay.

**Speaker 5 | 24:38**
This pipeline, this on auto, it's more to have an orchestration on top of this. Is this orchestration for pipelines? Our system has orchestration for one pipeline, like take this node, run this, take output, input, and so on.
This pipeline that you showed is more about having orchestration on top of the old pipelines, like we can have a control on...

**Sam Hatoum | 25:02**
No. This would be a replacement for the pipeline. If we once we go with it, it would replace the old one because this is actually a full-blown runtime. Like this is a, you know, production grade run time, pipeline orchestration runtime.
So Mastra is a. Is a production grade one. Auto is one, Google S ADK, which is just basically raw, right? I think landgraph actually is another one. Let's put that on there. Landgraph or lang chain? I think it's langgraph. Have a look and just did like do the research, find out what else exists like just spend the time. Nicholas you should go do that part is like dominiic. I'd say you get started on one of those like maybe get started on the auto engineer pipeline since you're closest to the event sourcing and so on. I just get started on doing something there.
And then Nicholas, like, go do some research about the various other ones that exist out there. You know, talk to the LMS, ask Claude, ask Block about, you know, what exists, what we're trying to do.
But yeah, do the research. Figure out. Like I. Yeah. Like I say. Somebody wrote out there a bunch of stuff about, like, various agentic patterns. There's a bunch of agent patterns. ADK Google have written about them and, Lang chain has written about agentic patterns.
Okay, like you know how to run a genic booklet.

**Wesley Donaldson | 26:10**
Of.

**Sam Hatoum | 26:13**
From that I think you can go look for especially something that supports scatter gather, which is very important. What we're trying to do and all the constructs that would be useful for us to execute on Florence experiment on that scale.
Okay, that's what I would look at right now. Okay, so that we can start to see you know, like what exists. Dominic, I would say for now, mimic the pipeline we have today in the auto pipeline. They configure it as plugins, which just like reshape those like whatever we have as modules today, you'll be able to wrap them with a auto command like the plug in, right?

**Wesley Donaldson | 26:36**
Our...

**Sam Hatoum | 26:43**
So wherever you need to have a command today, just wrap it with that and get it on the pipeline. And let's see if we can look at the pipeline. Feel free to ask me questions. There are some docs there. Talk to me.
Okay. Where's your hand up? You've got three minutes before I got to meet Stacey.

**Wesley Donaldson | 26:55**
Yes, we have a couple of streams of work that we're actively doing. One is around categorization that Nicolas is running through.
I think my general ask is, are we pausing that work stream? Are we trying to complete that full transparency? I feel like we've been cycling a bit on some of those tasks. So QM layers, as an example.
So focus on those or then pivot or pivot to these. If we pivot, then how do you propose we handle comms back to the client around the deprioritizing the existing work?

**Sam Hatoum | 27:23**
Well, what are they waiting for and who is waiting for it?

**Wesley Donaldson | 27:26**
I don't think they're not waiting on anything.
It's these things that we've tackled based on feedback that we received from Ruben or from... We receive as part of the demos. So there's no hard... We're committed to delivering X.

**Sam Hatoum | 27:38**
Yeah, that's fine. Then just say, "I spoke to Jeff and Brian and everybody else, and we're pivoting over to... We're pivoting to this." Just put it in the chat right now to manage the comms and say, "If anyone would like to find out more, please reach out."
But as per Jeff and Brian, we're focused on experimenting with pipeline orchestration so that we can run... Florence experiment? Yeah. Create the infrastructure to run with an experiment.
If anyone has any objections, please shout now, otherwise see you on Thursday.

**Speaker 5 | 28:01**
On Thursday.

**Nicolas Berrogorry | 28:03**
Okay, I don't have objections, but I have info that may be complimentary. Let me share the screen. Let me know if you're seeing it. Yeah, okay, if you can see a screen... The pipeline that we have now is already doing a big part, if not all of the parts of the Florian experiment.
That is linear. The one that just runs the experiment, applies the random variations, and measures... Today I finally achieved that with a QMM. So we can say the other day I showed that we have the short algorithm run.
Only the baseline, but now we have QMM applied to it. And crazy enough, these things should converge to these values, to these four peaks. And every QMM version is conversing to that peak.
Some of them, for some peaks, are conversing even faster. So it's like taking away from the other peaks. In contrast with the baseline, which is here and under this green one. But this green one is QMM, and it's conversion is a little bit faster than the blue one underneath it.
So it seems like QMM is working for sure. So I don't know, interesting results today.

**Sam Hatoum | 29:41**
Great, I love it, so good. Now this obviously doesn't scale to.
Beta like somewhere that that's why I'm saying Nicholas like go find something that maybe isn't that isn't production ad k what landgrath have to say that spell shit I got to go by this back by.

**Wesley Donaldson | 31:22**
Alright, I'll get the tests up inside of Jira for us. I'll take care of the comms back to the client regarding the pivot. One thing to ask is that I'm still always worried about how we connect back to the steps that Jeff provided.
If we can maybe find a way to maybe the naming here or just even having different nodes that we can just show that we have a circuit, that we have a node that represents whatever steps are missing. I think we had talked about this before. Just have it be like it does nothing. Just take an input, pass it along the chain, just so we could show that. "Hey, we know that these steps are coming."
That's my... That would be my only addition to what Sam has asked for.

**Nicolas Berrogorry | 32:05**
Okay, how about I add a node to kill two birds with one stone so we can run this circuit in Krisp in actual IBM hardware? Basically, that's another note from the specs to be able to run in hardware.
So how about I just create some extra nodes here that allow us to run in IBM and just...

**Wesley Donaldson | 32:31**
I think there's a lot of confusion from Jeff on that. The last thing he said was two things.

**Nicolas Berrogorry | 32:36**
Okay.

**Wesley Donaldson | 32:37**
If you listen to the tone of the conversation, it's just like... It's not as special as you guys think it is.

**Nicolas Berrogorry | 32:42**
S.

**Wesley Donaldson | 32:42**
It's just an API call. That's the core takeaway from there. Then this idea of "make sure it runs in a simulator first." I think it's misleading what we're saying. They're in one breath saying tested on hardware, but in the next breath saying there's no need to test it on the hardware.
It's just a basic REST call anyway. It's not magic. So my guidance is "let's not run the risk of incurring large costs or running the back and forth with getting an API from Jeff." That's a thing we need to do.

**Nicolas Berrogorry | 33:03**
Yes.

**Wesley Donaldson | 33:13**
Let's punt it down the line. I wouldn't spend any time on that now because it's not clear from Jeff
that it's something we actually need to do. So my... Let's just take Sam being the lead here, let's take his direction. We'll run with that. I'll get that documented accordingly. I think my ass would be maybe trying to close out work that we have in stream right now.
Maybe if we give ourselves a timebox amount of effort just to close that out or get to a good state where we can just write up where we're leaving off and then walk away from it. I just don't like the idea of us having put in ten hours into a thing, we're just going to abandon it without any output.

**Nicolas Berrogorry | 33:51**
Yeah. On my side, for example, I think that with this graph here, I already have quite a few things to show Rinor, for example, and the theme. So this is already something that will be presentable for Thursday.

**Wesley Donaldson | 34:10**
Perfect.

**Nicolas Berrogorry | 34:11**
Yeah.

**Wesley Donaldson | 34:12**
So let's time box that, clean it up like we. And then we'll hit tomorrow. Let's target hitting Sam's direction for tomorrow and just kind of clean up what you can for today.

**Speaker 5 | 34:22**
Yeah.

**Wesley Donaldson | 34:22**
Write up a ticket plan for how you're going to demo it.
But let's just timebox that today. Then we'll hit tomorrow. Running with a new direction. All right, guys. Thank you so much.

**Speaker 5 | 34:33**
You thank you so much for we help.

