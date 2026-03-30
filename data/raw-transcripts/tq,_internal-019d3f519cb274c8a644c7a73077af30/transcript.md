# TQ, Internal - Mar, 30

# Transcript
**Wesley Donaldson | 00:02**
Good morning.

**Dominik Lasek | 00:07**
Morning, how are you?

**Wesley Donaldson | 00:10**
Coming in a little hot, but it's good. I like a little energy on a Monday morning.

**Dominik Lasek | 00:16**
Okay, that's great. That wasn't me this morning. We changed the time on the weekend, and it's always... The few days are really strange. I wake up and I'm not really sure if I'm alive or if I'm hallucinating.

**Wesley Donaldson | 00:31**
Yeah, the time difference takes a while to get used to. At least for me, it takes a good couple of days. So I love the fact that at least it starts on the weekend, that helps a little.

**Nicolas Berrogorry | 00:41**
Yeah, hello, everyone.

**Wesley Donaldson | 00:43**
Let's see, jump into the board.

**Nicolas Berrogorry | 00:45**
Sorry for taking a minute to show.

**Dominik Lasek | 00:48**
No.

**Wesley Donaldson | 00:49**
How worries.

**Nicolas Berrogorry | 00:52**
Look away and see early, and then I look back, and it is too late.

**Wesley Donaldson | 00:58**
All right, so good demo overall last week, so congratulations on that interesting round table. So that was a good meeting/interesting meeting again, Nicolas.
Well done. All right. So let's just catch up on status. Then I think I want Sam to weigh in on some of the other items that came up during our architecture and planning session as well as just some other things that are outstanding.
But the direction remains the same focus on the pipeline orchestration and being able to run our pipelines at scale. So with that direction still the priority, let's start with you, Dom?

**Dominik Lasek | 01:36**
Yeah, sure. Sorry, yeah, I'm still working on this one, and right now I am on the... That simulation evaluator is the thing that I'm working on right now. I'm extracting this one, and I'm almost done. I think that's the last missing thing in all of those modules that I already moved, extracted, and blocked us by running the Florence experiment.
So I think tomorrow I'm going to start to prepare the pipeline to somehow build the loops like taking the results, finding the best score of the circuit, and running it again and so on to fill up the Florence experiment.
So that's the plan for tomorrow. I'm pretty close to this one. So yeah, actually, I'm not talking about scaling this like the next iteration.

**Wesley Donaldson | 02:39**
Is this help me understand like the experiment is you're thinking like it's asynchronous processing is part of the pipeline. Is it more just like help me understand how what we're currently building gets us to be able to scale across, like multiple runs across the thousand, the tens of thousands that are being talked about here.

**Dominik Lasek | 03:06**
I would say right now I want to just create the pipeline that we are able to take.

**Wesley Donaldson | 03:07**
Help.

**Dominik Lasek | 03:11**
A circuit goes to a variant producer to get some variants, then optimize parameters run on the simulator, then take those results from the simulator and find the best one, the best result, the best circuit that produces the best results.
Run it again like the same loop with the variant producer parameter optimization simulator and so on. The step when I decide that it works well is when the threshold of those scores is more than 90%, let's say 80%. I need to think about that more.
But that's the first iteration on that. Then I want to somehow delegate as the scattered gather some... So somehow delegate those simulations to be run in parallel as far as I know.

**Wesley Donaldson | 04:07**
Okay, so then let's...

**Dominik Lasek | 04:09**
So that's the next iteration of that.

**Wesley Donaldson | 04:11**
All right, that makes perfect sense. So there are clearly two elements to this flooring experiment.
Part one is proving it out like we can run. Part two is actually using scatter gather, making it more parallel, and being able to hit that scale. Right. Okay, I'll break out a second to help you track it.

**Dominik Lasek | 04:24**
Yeah, exactly.

**Wesley Donaldson | 04:26**
All right, Nicolas, over to you, sir.

**Nicolas Berrogorry | 04:30**
Okay, so regarding exactly that, regarding the scatter gather, is something I think is something else besides a scale. Of course, you have to think about scale when you're doing any technique like that. It's not clear to me which part of this category you're in, but I am working on changing the bucket. So instead of taking individual circuits, it takes the whole batch of circuits.
So you provide a series of variants. You just send it to a server. It handles back pressure. That means having more circuits than we can process at a single time in parallel. Basically, it uses that leveraging what's called a Krisp serverless. Which is basically a way where you host a Krisp instead of having Python code imported and loaded the module, and then you send a single sequence, and then you return the result and close it, and then you initialize it again for every step. You basically keep Krisp alive.
It uses something called Ray, which is a parallel execution framework, and that basically is going to be able to run. I don't know if we have a million sequences, you're going to go through them in batches of 200, for example, which is way more efficient.
We will handle that for us. Basically, we can send the media to the server, and the server will schedule everything and run it. Basically, that's only for their execution. Then I will work on the parameter optimization, which is another one that should be worked on.
But yeah, I am almost ready with this. I actually was just able to have all the containers for this up and running. I may have to think with them about how to integrate that with Helm because I'm using Docker Compose, but, yeah, that's... At this moment I'm starting to test.
If basically everything works just like before but with a new, more efficient...

**Wesley Donaldson | 06:40**
I view that as all part of this 114 task. Do you disagree?

**Nicolas Berrogorry | 06:46**
Yeah, because it's no longer research. I'm like, "The research result that I have to implement the... I in a few options."

**Wesley Donaldson | 06:55**
Okay, so you're absolutely right, that's more the research, so let's maybe close out the research, I guess.

**Nicolas Berrogorry | 06:56**
I got it. Yes, conclusions are there and intermediate steps like... Against... With documentation will always be stored.

**Wesley Donaldson | 07:01**
Where did you document like your. I obviously you shared it inside of the. The demo, yeah?

**Nicolas Berrogorry | 07:16**
There is a research folder inside... In the repo. If we want to produce any kind of document or anything, let me know how we want it, and I'll extract something.

**Wesley Donaldson | 07:28**
Yeah, I think they're a bit of a confluent shop, at least, Jessica and... So I'll create a ticket for you just to pull that out and put it into a Confluence page, and then I'll create another ticket that basically translates. That closes out research and creates an implementation task for us based on what you have in these comments three.

**Nicolas Berrogorry | 07:48**
Yeah. It's for the distributed computation. For the simulator. It's three... What I'm doing this week or a...

**Wesley Donaldson | 07:54**
Okay, so real hard we're going to hold off on three as a target for this week. You already have that, we're already good here. AI Agent Engineering, give me help me a bit with number two. Is that...?

**Nicolas Berrogorry | 08:09**
Okay, yeah. Number two is you see that we have... We need a way to produce the millions of sequences or well, it's not the same having millions of ST and running it a million times, which is, I think, what we will want for this first experiment.
But once we want to create a massive amount or a massive search or certain types of circuits, and create variations of those circuits with the agents, we will need better agents because right now it's like a prompt that lives in a text file and it basically says, "Hey."

**Wesley Donaldson | 08:30**
[Laughter].

**Nicolas Berrogorry | 08:46**
LM, "Hey, Claude, here are all the secrets and here's the prompt."
That's basically the most silly version of a nation that you can have, but there are more complexations that you can do. For example, "Hey, here's the prompt, the sequence, do a first stage, then look around a little bit, take a look at the QMM prior, try to create something that isn't in the prior yet." All of that stuff and anything that takes loop stages, valuation stages, all of that.
It's like the variant producer, basically, it can be way more complex and efficient and all that. That's the AI agent's tab that I like the number two.

**Wesley Donaldson | 09:30**
Okay, that feels like another stream of work, Nicholas, so I think maybe we'll... Let's create a ticket for that and we'll put it in the backlog.

**Nicolas Berrogorry | 09:35**
Yeah, it's...

**Wesley Donaldson | 09:39**
No, we'll put it on the reg.

**Nicolas Berrogorry | 09:39**
Yeah, I don't know. Like, I didn't hear, like I didn't feel the need on their side to make better ations yet.
Because you know, with all of the tent tentative stuff with stogasy compression and QM M we can do experiments to make more complex aations if we want like a separation.

**Wesley Donaldson | 09:56**
No?

**Nicolas Berrogorry | 10:02**
But I don't... For example, I don't know yet how I can improve... If I were to make a more complex agent, why would I even do it?
I yet don't. So we... Sorry, let me start again. We recently iterated on the agent with Ruben, and we met the most immediate expectation. Maybe we have to take a look at it again and see if we want to continue polishing it or not.
If we want to continue polishing, maybe then the need arises to create a more complex agent.

**Wesley Donaldson | 10:35**
No, I think the general feel I have from conversations with Jeff is he wants Slava and Sasha to basically be the SMEs on this.

**Nicolas Berrogorry | 10:35**
Yeah.

**Wesley Donaldson | 10:43**
So he didn't explicitly say not to include Ruben, but I think the direction is to let them be our SMEs. So to that end, Nicholas, I just think we just need to do a little bit of a better job of just again closing out stuff that we have in progress or disagreeing that it's abandoned.
So if I can ask you for the end of the day today, just give me a POV on where these are. I can have a sense excluding them when I'm not clear on that one, but if you could just give me a POV as to the what is the current state...

**Nicolas Berrogorry | 11:09**
Yes.

**Wesley Donaldson | 11:15**
Is it enough progress made? Where we can close it out and write up a finding or do we feel this is still ongoing work?
For example, the circuit categorizer is on hold for many things, including the multilayer me like, is it enough? Is it blocked? Is it no longer relevant? Don't answer now.

**Nicolas Berrogorry | 11:32**
First... Okay. Yeah. I can bring you those conclusions later.

**Wesley Donaldson | 11:35**
Take it, take a little bit of time, think about it, and then aim for the end of the day that you have some time to actually think about it, okay?
All right. Sounds like everyone is clear on what they're targeting. I owe a couple of tickets. That's fine. So I'll get those over to you guys. I just so you're aware, there are a few things that we have in our backlog based on some conversations that we've had with Jeff.
But I'm going to be working with Sam just to get a prioritization on this and figure out what the next steps are. I'll build out some additional tickets underneath each one for us. Okay? But stay the course for now.
Then once I have additional direction on these two third-party MCP and data epics, then I'll get back to you guys, right? Any questions or concerns?

**Nicolas Berrogorry | 12:20**
Okay, so you...

**Dominik Lasek | 12:23**
I have some questions for Nicolas, but I think we can do it on Slack if so.

**Wesley Donaldson | 12:28**
Sounds good, gentlemen. Always a pleasure.

**Nicolas Berrogorry | 12:29**
Okay.

**Dominik Lasek | 12:30**
Yeah.

**Wesley Donaldson | 12:32**
Enjoy the week.

