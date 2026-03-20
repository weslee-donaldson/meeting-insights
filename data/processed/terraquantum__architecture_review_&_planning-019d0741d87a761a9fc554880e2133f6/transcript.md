# TerraQuantum: Architecture Review & Planning - Mar, 19

# Transcript
**Wesley Donaldson | 00:22**
Compassion project. I was like, "Dude, just disable the button. We'll deal with the downstream." That was my response to him, but he felt very strongly about it.

**Sam Hatoum | 00:31**
I'm glad I wasn't the first person to say something.

**Wesley Donaldson | 00:34**
Okay, it's like... We're... This is not needed.
We can solve this downstream. The simple solution is just to disable the button if someone forces it through a script or something. We'll deal with the downstream. It's going to be a duplicate in...

**Sam Hatoum | 00:48**
Know question is distributed systems thinking. And like, it's creating troubles, honestly, like if you just like the amount of infrastructure you have to put in, like treating everything as a database, you know, it's like, hey, let me just hold onto state everywhere in databases. This is the thing the event sourcing community fought for so long.
And like we've won it at LS and the last thing we want to do is put it back in.

**Wesley Donaldson | 01:09**
Yeah, he's a little old school in that regard, but that's where that exists.

**Sam Hatoum | 01:12**
It's not as much as old. Who is Wijj?

**Wesley Donaldson | 01:14**
I like... Dude, we'll get to it in architecture. Don't worry about it. That's exactly what happened. Hey, Jeff.

**Sam Hatoum | 01:19**
I'm just talking about another client. Good, how about you?

**Wesley Donaldson | 01:28**
That with my camera.

**Sam Hatoum | 01:32**
What are you going for? What are you in the...?

**Jeff | 01:37**
I'm not sure, but next week's a possibility because Taylor's in town, so maybe one Wednesday.

**Sam Hatoum | 01:44**
I'm definitely in on Friday. Maybe I'll go in on Wednesday too. Want to see you guys.

**Brian | 01:50**
Yeah, we should get music.

**Jeff | 01:55**
Right? Yeah, let's pencil that one in. It's about the time we go back in there, you're at least collecting mail.

**Sam Hatoum | 02:03**
I'm just going to block the whole day and just say "schedule." That way, no one can book any appointments. I'll just have the day. Google, especially you.

**Wesley Donaldson | 02:14**
He means me.

**Sam Hatoum | 02:21**
So Brian, Rona.

**Brian | 02:25**
Looks like you got some nice weather out there. I'm jealous, it's gorgeous outside.

**Jeff | 02:32**
Yeah, definitely was like as too.

**Brian | 02:35**
It was like a couple of feet of snow about two hours north of me. I didn't get it, but it's still cold.

**Sam Hatoum | 02:43**
Just so far away. Yeah, figuratively and literally, it's just... Alright, what we got to cover today then? So the guys are cranking, got some rags to riches going on. We've got some of the proof of the experiments and so on that we've done.
What do we want to go next? That's really the question for this group.

**Jeff | 03:14**
Well, we're stuck right now because we really do need those guys to win, and there's a meeting on Monday or Tuesday at the latest to finally get them oriented to what the ask is, their commitment, and that sort of thing.
But in terms of the meat and potatoes here, I should say plant-based protein and potatoes. The work that we can do right now... I'm afraid that if we continue down the path we're going down, we're just continuing to go forward on something that needs us to really pause and evaluate.
It's a fact that we need to make this right, and there's got to be things we can do in and around all of this. You mentioned, for instance, Sam to me, concepts around potentially parallel processing or job tracking and talk. We should talk to Rinor about what's available already versus what that would be.
We should not dive too deeply into the core logic of this thing further, except for some of the explorations that have been done for the reason that we do need these partners. I'm not afraid of building things that we've said all along are prototypical and throwaway.
But I almost feel as if Nicholas and, to some degree, maybe Don or something, are feeling a sense of comprehension of the actual core issues without ever really being able to have a true comprehension of them. You can't...
I already know this very well because I've dealt with this for years now. You can't snap your fingers and be a mathematician. It doesn't work that way. Understanding what stochastic compression is and what it does and when to apply it isn't something you can just figure out in a month. LMS or no LMS, it's just not that way because the situational components here relate directly to optimization, and they're very data science heavy.
They're very particular, they're very bespoke to particular situations. Sometimes they work, sometimes they don't. When I see engineers looking at this and going, "Here's a way for us to store all these different circuits and make comparisons and all that makes total sense to me because those are just the types of things on a roadmap for engineering." I would expect, regardless of what the way of actually scoring those circuits against each other or differentiating between them, that can come later, and we can still do that work.

**Wesley Donaldson | 05:56**
The fact that...

**Jeff | 06:06**
So I would look for things like that. What are the things that we can do that keep moving the ball forward for a couple of weeks but don't iterate on the core?

**Wesley Donaldson | 06:12**
[Laughter].

**Jeff | 06:19**
You know, QMM application of that logic of QM M and schastic compression in that cycle. What can we defer without getting too deep into that?

**Sam Hatoum | 06:30**
The one thing that keeps coming back. I keep coming back to my mind is when I was talking to Florian about, like, running experiments. And he wanted to run an experiment on mass, right? And like it was something to the effect of we run a circuit, let's say a thousand times, and then some percentage of those the circuit output is the same, and some percentage it's not.
So if you think about it as a bell, somewhere in the center, that's going to be. I don't know, 600 800 200. I don't. Some level of commonality where the REST are like different. And so he calls the different ones errors and the common ones the, like the correct one.
So then if you then fire, if you then make some changes and run out again, does that 200 become 400? Then does it become 800? You get consistency effectively is the answer because inherently it's unstable, right?
And you want to get more consistency and whatever you can put in there as QM in various places, then that could create more consistency. That's what he wanted to do. And like, he wants to do it on mass. Some kind of experiment that can do that on mass.
And so there's quite a few variations we can put into that and run it. Now, if you think about, like, the infrastructure required to run something like that, that's a pipeline orchestration problem, right?
Like it's. I'm going to run this a million times, and then I'm going to get the results. And then based on those results. I'm gonna have something that loops back and it reruns the pipeline and so on.
So it's a, you know, if you want to run, if you want. If you were to hand program an experiment like this, it would be a sequence of events, and then you'd have a bunch of loops that go back and try again and again with results.
Right? So knowing that that's a the experimentation like lab, if you like building a lab there the infrastructure required to carry out that one experiment we don't have right now. We have something very light that could maybe, you know, you could handcraft a couple of runs through it, but we don't have something that could run it, you know, 10000 iterations and bring us back an answer in parallel. In parallel? Exactly.

**Brian | 08:18**
Like. Like you could run it in one task, right?

**Sam Hatoum | 08:21**
Yeah, exactly, so that's missing. We on an auto have a similar problem because we determine something like, "Here's a deterministic thing. We're trying to get to a target." You then run a bunch of agents, and then once it gets to the thing passing the criteria, then we say exit the loop.
That's basically the self-healing, self-running, self-learning loop. Now here, it's a bit more complex because the circuitry is like, "We want to just introduce randomness into it." Here's a circuit. Great, let's vary it.
So you give it to an LLM to vary potentially, but you might just say insert the...

**Wesley Donaldson | 08:56**
[Laughter].

**Sam Hatoum | 08:56**
So insert QM here before, after, or during the gate. There are all these different places you can vary it before you can rerun.
Anyway, I think that's...

**Brian | 09:05**
Go ahead. What would we break this down to? Basically just running simulations in parallel, right? Yes. So when you're... Would you have some static process that runs on itself to create all the variations and then fan out to execute the simulations and then fan back in to collect the results?

**Sam Hatoum | 09:26**
Yeah, exactly. It's those things, like it's Fan out, Fan in. But I think there's... How do you... How do I describe this one? If you think about it, genetic algorithms, right? Each attempt to do something, if it passes, you double down on that and you fan out more from that.
Alright, so now you've got more... If you want to get good results out of it, if you just want to randomly completely...

**Brian | 09:52**
It doesn't all have to run at once or in one shot, right? You would still have some orchestrator that would fan out to experiment and watch and then possibly create other fan-out jobs. I think that what you're saying, right?

**Sam Hatoum | 10:05**
This is it. What you're saying right now is how do we design a system that does this kind of thing? That's really it. It might be that all of these things just fan out and then they put a job and then something else is processing all the jobs to then give it back to the thing rather than have so separate the job running from the... Which actually would be in line with what we would do in a real-world job with a proper QPU. Not that they've ever run these experiments there, but my point is that way it's leveraging the same system.
I'm going to put a job to be processed. Once it's processed, it gives it back to me and so on. So, this is an interesting area which is now building infrastructure. Now we know we don't want to build infrastructure for stuff we don't know.
It's ready where customers are not going to get value because that's throwaway, but busy work because it's not... We're not learning anything new. So that doesn't sound right.
But if it's to support Florian and his experiments, that's valuable. So that was my thinking. I've got some ideas of how we do this, but that was just to frame the problem first.

**Brian | 11:11**
Yeah, do we. Do we know that we are limited in simulation like we're anticipating that, right? But how long does it take to run a simulation of a circuit today?

**Sam Hatoum | 11:23**
It's actually not the... Sorry, it's not the limitation is not the running of the simulation. The challenge is in the management of the data so that the experiments can run effectively, right?
Like the loop.

**Brian | 11:37**
Okay. So... Yeah, it may be as much orchestration rather than infrastructure, right? My question is specifically about infrastructure. Maybe we do or maybe we don't have a problem there. I don't...

**Sam Hatoum | 11:47**
I don't know, I don't think so. I wouldn't care about that. I think Krisp runs quickly enough on a machine if we have to.

**Brian | 11:53**
But I don't know.

**Sam Hatoum | 11:55**
I mean, we could probably just, you know, every job that runs can run its own Kisskit. Like, then it's just a case of CPU and memory on your computer. Like that's probably all that matters.

**Brian | 12:04**
Yeah, or if they all run in a 10th of a second and wait do no.

**Sam Hatoum | 12:09**
I think that's the least of my concerns. The bigger concern is creating the right fidelity in a pipeline that you can vary these experiments so you can say, "Okay, I want to run this in that... When the results of this come back, I want to feed it back to the variator, which then feeds it back to this." Something went wrong there. Let's change that.
So it first actually does a randomness first and then it does that. These are the kinds of things that Ruben/Florian would want to do. I'm saying we can build the pipeline orchestration layer or leverage what's out there.
I've got a lot to say about it. That's the main thing I think we could go solve today. That wouldn't that would be valuable. I've been doing a lot of pipeline work. A lot. It's funny enough.

**Brian | 12:59**
I mean, I'd be interested in hearing what you have in mind. I could see the value.

**Sam Hatoum | 13:04**
Yeah, okay, so I'll just quickly... Yeah, I've shown it up in a meeting. You remember the pipeline for auto, how things feed into each other, right? Being able to define something declaratively with code with a schema with something... Mastra has its own pipeline orchestration. Google has a 2DK agent development kit, and we've built a pipeline that is based on events and an eventing system that does very few, by the way, can do scatter together fan out, fan in very few. Which was crazy to me because it's such a typical agent-like thing you'd want to do, but a lot of people hand-roll it.
So there's a... Let's say there are twelve odd options for how we might do orchestration. I think that's what we've got to look into, what's going to be suitable. I think we just say, "Okay, here's Florian's experiment. What would it look like in these various platforms to do?"
So, let's try it, let's just try and get it done and then iterate from there, that's what I have in mind. We could have one on auto. It's open source. We could use that. I know it will do the trick, but maybe there's something more suitable for what we're trying to do here.
So that's the exploration.

**Brian | 14:19**
Yeah, my suggestion doesn't come from a huge amount of experience, but I'm not contrasting it with pipelines either, because I don't know the difference. But I would ask, couldn't we use something like an agent framework? There aren't those built with that kind of thing in mind, right? That you have an agent that is intended to be the orchestrator and knows how to reach out to other agents to do simulation and variation in the experiment and that kind of stuff. Do you like another thing to throw into the brain, perhaps?

**Sam Hatoum | 14:52**
Yeah, definitely. I always worry about that in an experiment because you have control and then you have... It would be interesting to put it in there as if we left an agent up to its own devices to orchestrate, could it come up magically
with a better result? So if the end goal is to get to, let's say, 80% accuracy in terms of the Q&A corrections, could we...? One is like having this iterative genetic algorithm process, which is a mathematical equation.
It just basically goes and does this versus another one, which is just a random scatter and just see which one wins, right? That's all we're going to do. Nothing crazy. We're just going to randomize and that's it. Spread versus give an agent some agency and give it the different variations it can do and fire off 50 of those at the same time and let them do it.
So I see it fits in well there.

**Brian | 15:47**
I would assume in that agent framework that the scope you have many agents and the scope of what they do is very constrained to help control that problem, right? Rather than one... Rather than just tell one agent figure it out.

**Sam Hatoum | 16:03**
Yeah, right. Agree. So this whole area we just spoke about... We can get into that with the team and we can open that rabbit hole and all jump in with the aim of... Can we leverage the combination of all the pipeline bits that we've put together so far?
Right, because the pipeline we have right now is a configuration that you can vary. And that's just an experiment you could run, right? We could configure it so that it says... If you imagine everything we've got in there right now becomes a command, and we could just fire these different commands in a certain sequence...
That's the script, so to speak. I don't know, I'm just thinking out loud right now. Yeah, Jeff, is this aligning with what you're thinking and what you have in mind?

**Jeff | 16:52**
Yeah, exactly that. I mean, there's so obvious... As you said in the beginning, Sam, there's IO stuff we need to deal with, right? Some of that is outside the concern of what the actual details of the engine, the low level of the engine, and what problems it's solving.
I see this is valuable anyway. One of the things that's been crossing my mind is not just this tool but any tool that we utilize that has an effect in some way through simulation testing, eventual prep to run on machines. There are so many variations in the platforms.
That's not the same as cloud platforms because you can't really rely on a job that gets sent to a queue provider to process the way you can expect a transaction against the cloud backend. You can't because they have these bizarre random queues. They don't tell you what's going on with them or how long it's going to be. They just give you status. It could be days, could be hours, could be minutes, could be seconds, and that's for every single shot.
The context of that could break at any second, and they don't handle that for you. They just report on it. So I mean, we're dealing with a lot of unknowns that are changing all the time, too. For that reason, I always get concerned.
But I mean, where else could this apply? How can we make this something that is valuable to us, not just within this Q&A framework, but away from what we're doing? And what I see is that I'm just weighing that in my mind. I'm thinking there are many places I haven't called specifically one out, but let's talk about that for a second.

**Sam Hatoum | 18:46**
I think we did with Cubridge, right? We enabled MCP so now we can plug anything. We have infrastructure that connects things as MCP tools, with authentication and so on. I think similarly here, it's like we have... We want to set up an agentic workload. In this case, we're going to drive Florian's experiment through it.
But if you think about what you previously did at... I don't remember what it was, but it was like this gigantic map of all the different agents that ran with all the results they were run on. ChatGPT was costing thousands of dollars. What was that effort called? Jeff, which one? Somebody did a bunch of agents like a whole bunch of agents running, and they were feeding from one to the other like it's a giant machine that we... That was demoed to us. It was a long while ago.

**Jeff | 19:34**
I think all you're talking about is the. Is the agentic workflow for TML yeah.

**Sam Hatoum | 19:42**
Yeah, exactly right. That was it. Yeah, that's something that could be represented in this approach where if you have a pipeline that can allow you to express an agentic workload, they were doing an agentic workload, and this then is a gentic workload running infrastructure, right?
So it's actually not...

**Jeff | 19:56**
Let me stop you there for one second because there's one clear ask from that specific team that I haven't really spoken to you, Brian, about this since I talked about this at the offsite with those guys, but they've come to a place where they're publishing benchmarks.
Look how close we are to the state of the art. And they're not close. They're orders of magnitude away from being able to run in parallel and get the results from that they're seeing from other engines out there.
They asked us to help but basically, I offered to help and said, "Can we help you scale this out and run parallel jobs?" So would this contribute in that space because they're running on one VM right now, they're taking results back from that they're benchmarking them. They think for some reason, I don't understand, you're six decimal points away from where the other guys are.

**Wesley Donaldson | 20:58**
That was...

**Jeff | 20:58**
You're not close, right?
So...

**Brian | 21:02**
But you're... But you're mostly asking...

**Jeff | 21:05**
About the supply.

**Brian | 21:06**
Infrastructure scale, right? Sam was mostly talking about the orchestration of infrastructure without necessarily needing infrastructure yet now those could marry up a little bit, right? Even with the QEP thing, does the orchestrator queue as well,
expect that there's a big delay in the next step of fanning out infrastructure before we add it, or wait for two days for the QPU to respond or something like that? I think they're two separate things, right?
I mean, what do you think Sam did? Are you hearing two separate things as well?

**Sam Hatoum | 21:38**
I think so. I mean, maybe what I'm going to show here will probably clarify it a little bit more. Just like if you think of this declarative language here, right? We're basically... You say, "Forget this here."
This could be at Terra Quantum, circuit modifier at Terra at TQ stochastic compression. These are just plugins. So we can develop a bunch of plugins as individual modules and we plug them in. We say on the pipeline started this on stochastic compression completed do that right.

**Wesley Donaldson | 22:04**
The power position how and we get back to that before the court that the court with as much more that I think that a so...

**Sam Hatoum | 22:04**
So this is just when... Then very easy. But now we get into more interesting stuff like... Okay, when all of these have settled, as in they're done, then dispatch this. When you dispatch this, send it in this approach.
So it's just a way for us to start defining what a pipeline looks like on this thing. But when specific conditions have happened, then emit that. That's really what I'm talking about here. How do you construct a complex job graph that executes? That's really what this is. As for where it runs in terms of infrastructure, target, and deployments and things like that, that's completely separate from what I'm saying.
Like you say, they marry up in that you could run on certain infrastructure. Yes.

**Brian | 22:45**
Jeff, they're not asking for that necessarily right there. They think they have that already. They're just asking for running and...

**Jeff | 22:54**
They just don't know they don't know what they don't have. They're going to need both. They're going to need the infrastructure.

**Brian | 23:00**
We do.

**Jeff | 23:01**
Yeah, they do. They're going to need infrastructure help and they're going to need orchestration help. And what I think this is an opportunity for is for us to justify what we're talking about doing here and using it as a way of seeing how this might apply to their situation to make it just a bit more extensible for ourselves as well.
So here's the situation. It applies on QM we know our remit, we're kind of chasing that. We understand the architecture and the plan. Hey, how would this apply to the Gentic workflow? And that doesn't just legitimize the work, it extends this team into working with that team, which I kind of want to do. I kind of want to bring the Tel agnic guys away from their engineering and get them into more requirements, definition and handoff because I don't trust their code, I don't trust what they're doing, and I don't think they know what the fuck's coming.
It's just not that they're bad or not smart, they're very smart guys. Nathan in particular... He's driven as smart as... I like that guy a lot, actually. He seems trustworthy to me. What I don't trust is that they don't know what they don't know.
So just like any kid running forward with a knife in their hand, they don't know what could happen. It may not fall down, but eventually someone will grab that knife away from them and do something to help them or give them a plastic one.
So I just want to make sure we're clear on why we would approach this and how we would approach it. I don't want to blow it up into some massive scope where we have to go study what they're doing and all this stuff.
But doing what you're saying is doing it for ourselves and then coming back to trying to see how it would fit and apply in that situation. Meanwhile, Brian, if I'm going to send you off on a mission on this one, it would be that I would ask that you start to evaluate with maybe Mario or somebody what's required of those guys to scale back at because they don't even know where to start.

**Brian | 25:12**
So maybe it's worth just taking two minutes to talk about what we have done so far, because I think the pattern works for a lot of this. Sam, just for your information, maybe because you could think about it and think if this would work for you or if you think there'd be challenges in TQ 42, we provision infrastructure for every job request
so that we could scale horizontally. So all we really did was... There was an orchestrator centrally that understood how to speak the Kubernetes API that it was running within. The Kubernetes cluster was running on autopilot, which just means basically serverless. It provisions the hardware in response to the workload that you want to run there.
So we just said, "Run me another container. And then the infrastructure would show up for that and then go away after that one workload ran. That actually works as far as going as horizontally as you need with the existing containers that we are running things within right?

**Sam Hatoum | 26:16**
We built the infrastructure.

**Brian | 26:18**
Basically. Well, we didn't run like functions. It was already in Google, but Google's Autopilot runs that way. That's how they host Kubernetes. So we just said, "Just speak to the Kubernetes API so that instead of deploying with deploy tools, the application itself just talks straight to the Kubernetes API." What do they run?

**Sam Hatoum | 26:38**
He's running a container. Is that it? It was basically...

**Brian | 26:40**
Yeah, okay, but that's how we got horizontal scale pretty easily. So for what it's worth, I mean it. That pattern seemed to work just fine, but that would be the first thing I would suggest to them too, just keep in mind in case we need to approach that.

**Sam Hatoum | 27:06**
Well, we make that easy, right? If we plug what you just said to this orchestration that we do, and they don't have to think about that, they just basically have a process. Then behind the scenes, that gets run on this runtime effectively like this thing you're talking about is a scalable runtime.
So then, yeah, if we create these pipeline definitions and experiments and what have you... And they do end up actually running there as the runtime. I mean, without requirements, the potential's infinite without us getting to truly understand it, but definitely something to keep in the pocket. I don't know.
I think Jeff, the answer to that question then is like, "Could it be useful to them to bring them in?" Yes, as soon as we understand what they're trying to do. I think if we create a capability which is I can orchestrate and another capability is I can deploy to a runtime and then potentially combining those.
That's really what we're saying here. Is that useful to them? Sounds like it could be. Especially the runtime is what you're saying? Well, we start with one.

**Jeff | 28:20**
I think that's the way to go.

**Sam Hatoum | 28:22**
All right, okay, so whereas you had your hand up a minute ago, it's gone now. Probably just got bored of everybody talking and getting a turn. So what was that about?

**Jeff | 28:30**
No, it timed out.

**Wesley Donaldson | 28:32**
Timed out a couple of times, and you hit the mic. I just wanted to fly a couple of things that we talked about last time to see if those are still venues for us to explore. One, we brought back the idea of running on hardware, right?
So is that something we want to just prove out because we've never... We've not done that. We've kissed it, but we haven't done any actual IBM hardware or similar hardware. So start there. Is that a task? Next one is you'd mention this idea of "Could we do some prerocessing?" Is there an opportunity for us to add something where maybe we get a circuit or maybe we get some data that's going to be used to train the circuit like due to some preprocessing and third-party information? That was another idea we touched on the floor and experiment. Another idea we had was this idea of "We've done orchestration, we've sorry, we've done the pipeline. We've shown how we can pass different nodes information through."
I think maybe we instrument out, we implement out all of the steps and just have proof that each one of them... Then we can take each step as its own exploration effort and be able to evolve each one of those quasi-independently because they're all already orchestrated to the system that we have. A few ideas of things that we've already brought up. Let's see what else...
Sorry, I closed the dashboard. The third party, Krisp, already touched on the enhanced pipeline we just spoke about. Yeah, just a couple of things there to add.

**Jeff | 29:55**
In...

**Sam Hatoum | 29:56**
Wesley's developed Vicode, the super facilitation tool that he uses. It is actually all right now his extra super brain that's running there, which is pretty freaking awesome.

**Wesley Donaldson | 30:06**
Come on. Maybe I was for a second there. I almost looked like I had a great memory.

**Sam Hatoum | 30:12**
He's augmented himself as AI, that's more impressive than you've actually built the cyborg tools than being a cyborg.

**Wesley Donaldson | 30:20**
Fair.

**Brian | 30:20**
Are we actually talking to it right now? Is Wesley really here?

**Wesley Donaldson | 30:26**
A little bit of deep faking actually. I thought about playing with that as a prank for the wife. I thought she might still be on the radar.

**Brian | 30:33**
I would suggest avoiding the hardware until we run the simulation versions, right? I'd just be afraid of blowing the budget before we know what we want to run through.

**Jeff | 30:43**
Hardware... Well, I mean, we can... An API is an API, and we can run jobs that are made. We make sure that they don't run away and stuff by watching them. We can go through the steps just to show everybody how it works.
I think there's value there. I don't know that we should be going on a regular basis to the QP until we feel super confident on these simulators. I want to see value out of the simulators, for one thing, real value.
I don't think we're at the place where we can capture that we've achieved real value until we get away from those two sessions.

**Wesley Donaldson | 31:34**
Just one bit of additional context here. Jeff, I'm not sure if you're aware of this, but I want to give Reuben the opportunity to get some credit here.
He's had a session with us on Tuesday, and he volunteered quite happily to have another session with us on Thursday. He's responding back and proposing time options for my standing session during the day.
So he's leaning in. I think is my point there on just giving us feedback. His feedback has been very actionable. The idea of the generalization fix or error path that we were taking came from Reuben's feedback.

**Jeff | 32:05**
Yeah, that makes sense. Okay, well...

**Wesley Donaldson | 32:14**
So just loop me in on that. Yes or no. One had run on the manual the hardware because it was a clear item from last time.

**Brian | 32:27**
What will we run though? I mean, I raised that just saying the only thing we're going to prove is that we know how to consume a REST API, aren't we?

**Jeff | 32:35**
Pretty much. I mean, we've done it before so many times, and that's the thing. I don't I'm not sure we really achieve anything with that. You know, what we could do. I have an idea, to don't look into this, but, you know, there's a no cost way to run things on I BM, and that's to run against their actual simulators.
But I think they took them offline.

**Sam Hatoum | 33:03**
Yeah, I think he said that last time. Yeah, I'll tell you what. I mean, honestly, I don't think what this. I don't know what this is going to prove for us. I think this is interesting. Once people have a need for that.
Like.

**Jeff | 33:14**
I think you know what I'm going to do tomorrow morning. Engineering Roundtable, I'm going to take everybody through the IBM platform. Everybody will see it's just an API, and we can even look at previous job results, or we can even run some little dinky thing.
But I don't mind taking people through that so that there's no mystery, you know what I mean? It'll... People will be like, "It's just a REST API. It's just queues things up, and you get job status."

**Sam Hatoum | 33:42**
Okay. And then for us, I think let's just let me have a session with the team, to go through like the different orchestration options, things like that, like we can get exploring that.

**Wesley Donaldson | 33:50**
[Laughter].

**Sam Hatoum | 33:54**
I'll have a session with the team. We'll brief them on this, get them going, and coming back with some settings up the experiment in the top five competing ways of doing it.
Then we'll discuss that. I do feel like this will be a big enabler for the company. Just being for any company really today. Who wants to do agent-based workloads? Having an answer for how you can quickly connect them. There are a bunch of them. There's LangChain, LangGraph, Mastra, Roll Your Own, and using something like an SDK or solving SDKs. There are a ton of ways that you can do it. There are no standards yet, and we should not expect any for a while, actually.
But what is important is that you pick something and actually start doing agent-based workloads.

**Wesley Donaldson | 34:39**
[Laughter].

**Sam Hatoum | 34:39**
The means don't matter, it's the output, right? So I think we just find something, get it working, and we can shift it later.
We saw with Nexus and all of that. It's a shifting ground to get something working. Once it standardizes, we'll shift to something. But at least we've got the learning. How do you maintain?
I mean, in my mind, in an event sourcing way, it's pretty... When I look at things that way, it's like, "How do you maintain context and state across different agents and what have you...?" Well, projections and events and things like that give you that.
So we can just apply that lens while we're looking out for different platforms and see what's out there and then what does it look like to define Florian's experiment using five different ways?
I think that's a good frame.

**Brian | 35:25**
I agree. I don't know enough about the tech... thing, but to touch on that really quick again, my gut is that that's what they feel is their value already. They've created their own orchestration engine.
So maybe a first step there with them is to just get a presentation and ask a few questions to figure out what they have. Would we be completely replacing all of their work if we suggested something else?
Those kinds of things.

**Sam Hatoum | 35:55**
But yet we could grab what they've got, feed it into another, and tell it to reproduce it using our own infrastructure and our own orchestra.

**Brian | 36:01**
For maybe they have the best choice.

**Sam Hatoum | 36:04**
Maybe. I mean, I remember seeing it. It looked like it was a lot of timeouts, no retries, a bunch of stuff. At least the thing I saw so I wouldn't be so sure. I was very much. I haven't.

**Brian | 36:13**
Even seen. I haven't even seen anything. I just think that that's what they're building, right? As an orchestrator?

**Sam Hatoum | 36:18**
Yeah. Yeah.

**Jeff | 36:19**
True, yeah, all right.

**Sam Hatoum | 36:22**
Do you want to end early? Then in that case, just get those items going.

**Jeff | 36:27**
Yeah, we're good. One thing. I do want to come back to you, though, before we close out. So I met with Sean. I guess it was Monday or something. I want to relate this to all of you together. I want you to hear this because I want you to understand a couple of things. One, what we're up against.
But that it's really important for us to do these demos. So I talked to him and I asked him. I was talking about many different things. One of the things I came upon was, "Hey, you saw in that demo that I did for the investors with no prior knowledge, I didn't know anything about CVA or how to use it. In less than ten minutes, I was able to connect to the MCP server, get the tools, build and train a neural net model using data that was synthesized right there, and got a result back.
It all happened on the command line, and it was so powerful. When they showed the investors, they were blown away. He goes, "Maybe I'm not understanding this, Jeff. Isn't that just the same as what was there before with CBA? They're just doing it through a different interface?"
They said, "Sean, I want you to understand what I just told you. I didn't know anything about CBA. I didn't have to read any docs. I didn't have to understand the APIs or the SDK. I didn't have to do anything to start using it. Can you see how extremely powerful
that is?" That's incredibly powerful. It has nothing to do with that. It's agentic. Or any of this stuff. It's that I came in blind, and I was able to start using something in ten minutes. That's amazing. So he got it.
But when I say this is what we're up against, I feel like we need to really show the force through the trees to these guys again and again. Otherwise, they don't understand what the value is. I don't know how you don't understand the value.
It's clearly valuable if I put six or seven different APIs behind this thing, and I go, "Hey, what the fuck can I do with this API?" It shows me tools, and I can start working in my LLM. It helps me right away. Fuck me, man, you just took away half the problem with people signing up for TQ. 42 too much of a learning curve, right?
So we've got to get this in these guys' faces, and I want... I'm just saying that so you guys understand the complete disconnect because to me, it's an unbelievable fucking disconnect. Okay?

**Sam Hatoum | 39:20**
Alright, well, I mean, the best thing we can do is just make this as easy to use, right? Like... But being able to spin this up and get value out of it, converse with it and get it to create a pipeline and so on, the more we can do that then...
I don't know, it goes two ways because I think on the one hand, you've got people who will be like, "Wow, this is amazing. This is the best thing ever." And other people... Wait a minute, I'm not in control. This is a really bad idea, you know what I mean?
So that's the world today with AI. It's the embracing the non-determinism of it versus rejecting it. It's the jour of the day today. Those that embrace it, those that hate it, and those that are sitting somewhere in the middle waiting to see what the fuck happens.
So yeah, fair points. Alright, I'm going to actually go off to the city right now. I've got...

**Jeff | 40:12**
To go...

**Sam Hatoum | 40:12**
Yeah, I'll take my bike for service for once. See you guys later. Thanks very much brother, later on.

