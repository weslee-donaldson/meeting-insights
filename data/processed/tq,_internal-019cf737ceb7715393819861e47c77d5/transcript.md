# TQ, Internal - Mar, 16

# Transcript
**Wesley Donaldson | 00:14**
Test. Alright, that should be working. Hey, Nicolas, I can see you're talking, but I cannot hear you. It might be me. Let me make sure it's not you. You're good now?

**Nicolas Berrogorry | 00:29**
It was me. Check this out. Because I was having so much issue issues with the audio that I changed my headphone and headset and. And like, got like a Desk. Desk microphone.

**Wesley Donaldson | 00:41**
Yeah, that's a funny story with me. I've gone through the gamut of trying different things so many times. So yeah, I told honestly, that worked 100% all the time just using the damn laptop.

**Nicolas Berrogorry | 00:48**
What worked for you?

**Wesley Donaldson | 00:54**
Yeah, that was at one point. I got so irritated. I only use the laptop, but with Mac, the mic doesn't work if the shell is closed. So I then started adding things to it.
Then the other thing that worked consistently for me was only just using my Apple headset just to be done with it. Those are the two successful. So even now I have random times where it doesn't work.
But generally I'm good now. The two things that work consistently are just to use a damn iPod and then just use the laptop itself.

**Nicolas Berrogorry | 01:18**
Hey, damn, so I just spent like $100 and 20.

**Wesley Donaldson | 01:29**
No, I would say the importance of just paying for a good setup.
That's been a thing. So it looks like you have a nice setup there that probably will work fine. The $20 Amazon specialist was not successful for me.

**Nicolas Berrogorry | 01:38**
Yeah.

**Wesley Donaldson | 01:44**
Donald didn't say he was not going to make this, did he?

**Nicolas Berrogorry | 01:45**
My God, we were talking in the chat just now.

**Wesley Donaldson | 01:47**
Actually? All okay, yeah, there he goes.

**Nicolas Berrogorry | 01:53**
Maybe we should pin him.

**Dominik Lasek | 02:00**
So it is... I get the data OS and I clicked yes and then it started my entire piece. So sorry for that.

**Wesley Donaldson | 02:09**
Okay, hope you guys had a restful weekend.

**Nicolas Berrogorry | 02:09**
How are you?

**Dominik Lasek | 02:11**
Good. And good. How are you? No.

**Wesley Donaldson | 02:16**
Nice. All right, so want to like I think I dropped off a little early of the round table call, so maybe just let's give me just give me a little catch up. Anything interesting at it was raised as part of that call, anything that you guys heard that felt like opportunities that you wanted to tackle.

**Dominik Lasek | 02:37**
I wouldn't say so. It was finished, actually ten seconds after you left, so... Yeah.

**Wesley Donaldson | 02:44**
There you go. Worked out perfectly. Okay, all good. So then let's just jump into what we have on the board and some progress on that.
Then I do have some additional items. Well, I'll just share the board and we can talk through it. Okay? All right. Let's start with you, Dominik. Just looking at the "improve" column and you're on top.

**Dominik Lasek | 03:11**
Got it. I think that I said that already five times, so I need to say that six times.

**Nicolas Berrogorry | 03:18**
Yes.

**Dominik Lasek | 03:20**
I need to put comments in those tickets and move them to them.

**Wesley Donaldson | 03:23**
Three.

**Dominik Lasek | 03:26**
So, yeah, sorry for that. Yeah, I would try to...

**Wesley Donaldson | 03:30**
So that's the first one here. No worries on that, because I know what those statuses are. Just again, please... Then for this one, great conversation generally around it. I guess my question here is it's still work in progress. Is that the status?
"We're still investigating. We're still trying to figure out the process." That's a fair statement.

**Dominik Lasek | 03:49**
Yeah, actually, we are on the iteration that we are implementing, and that's what I'm doing. So yeah, it's in progress, absolutely it's in progress. As I mentioned, it's Slack. I implemented the system. I implemented actually I as the clode to implement that to implement and the end to end test just for the rug system to be sure that it at least works somehow. Then I created then I tested that manually with just one circuit.
But as the discussion with me and Nicolas on the Slack, I need to test that. As I said as well, I need to test that with a bigger dataset of the circuit. So yeah, it's in progress, and I'm working on that.

**Wesley Donaldson | 04:40**
Okay, well, good. Right, Nicholas, a couple of things on your plate, and I know they're all very much related. I think what we just need to get to is what is the first thing that we can get to a good state on, and then we can create secondary things just to again, my worry is more just showing progress. I don't necessarily care so much about the GE tickets. I care about us being able to demonstrate progress, and GOR is just a mechanism to help us do that. With that being said...

**Nicolas Berrogorry | 05:08**
Yeah, I need a couple of tickets for what I need today because every time that I go into the QME placement and the SQL categorizer, I find there's missing research that we need to do to understand how we even tackle that.

**Wesley Donaldson | 05:09**
Just kind of catch me up on where you are.

**Nicolas Berrogorry | 05:26**
The CU categorizer is very much related to RAG. We already covered a little bit of progress on that with the research Sequit embedding strategies, and Don has already implemented that. It that's what he told me earlier today. What I did today is I started thinking, okay, how do we even stress test this?
So, now that we have done RAG implemented and he's using the algorithm for embedding and that we created the other day, how can we actually test it? How do we know that it's finding similar secrets and not bringing in different secrets on the same prompt and all of that?
I started researching different datasets that we could use. I found that there are both sample circuits on different projects of all research teams and like quantum teams and companies. Some are open source and they are royalty-free.
So we can use those. In total, those are like 40 circuits. But then I found a team that is called the Munich Quantum Toolkit Group. These guys have 30,000 circuits that we can download and use for free. It has an MIT license, so that means that we can use it for commercial without liability.
So we can basically kickstart our database with 30,000 sets.

**Wesley Donaldson | 06:51**
Love that.

**Nicolas Berrogorry | 06:51**
To in testing, that's... Yeah, so that's an excellent question.

**Wesley Donaldson | 06:55**
Is there any labeling on those circuits? Is there any equivalent of labeling for quantum computing on circuits?

**Nicolas Berrogorry | 07:03**
What I found is that there might be some labeling, but the labeling will be related to whatever experiments they are doing and in the specific way that they are doing it.
What I found is that the most important thing is that when we have circuits, we can run them through our pipeline and see how our pipeline tags them and evaluates them and stores them. We can create our own rubric out of it, our own classification of those circuits.
See how that performs based on the input from the scientists.

**Wesley Donaldson | 07:35**
Yeah, I love that so much because that's just powers so many things down the line.
So it basically is like, "Create a better sample circuit." Here's your 30,000, right? So that's really the ticket 97.

**Nicolas Berrogorry | 07:45**
Yeah.

**Wesley Donaldson | 07:49**
I think maybe this is a conversation we should have. Let's keep it within the... Specific realm.
But this is... I think once Sam is aware, this is the thing. Let's figure out how we can throw together some ideas on how to better use just availability of those circuits. Okay, cool. So you're still researching those circuits right now? Figuring out how to apply them to RAG... Fig out how to test and demonstrate RAG works. Is that what I'm hearing?

**Nicolas Berrogorry | 08:13**
Not necessarily. So I can join into Dom's work. But I'm pretty sure that Dom can continue his line of work and just use those circuits. Find a way to download those and embed them in there. The other line of research that I did this morning is...
Okay, how do we build the categorizer? Now that we have the RAG, how do we actually build the categorizer? How then can we query the database, for example, through MCP and other types of queries? To find a similar sequence to find what is the actual structure of the data like, how do we represent that?
I found that there is a tool that runs in parallel to RAG that is called Graph Rail. That basically lets you represent all your dataset as graphs. And yeah, it basically lets you browse and query the data.

**Wesley Donaldson | 09:14**
That's great.

**Nicolas Berrogorry | 09:16**
In a graph-like structure.
That means, for example, our graph... I would have to take a look at what our graph should look like. And that even without implementing a graph database, doing the exercise of looking at what the graph looks like is very important for us, because that is our circuit categorizer.

**Wesley Donaldson | 09:34**
Okay. So why isn't that just the circuit categorizer?

**Nicolas Berrogorry | 09:40**
Because the secret categorizer ticket to me will be the POC feature that uses whatever we come up with. So th this is okay. I mean, yeah, we can. I agree. I agree that seqq categoryr could very well be the e. The. Graph drive research.

**Wesley Donaldson | 10:01**
That's okay, let's call it "This is the research, this is the grounding." I think we need an epic grounding generally.

**Dominik Lasek | 10:05**
Okay.

**Wesley Donaldson | 10:06**
So we'll say this is the research ability technique around the graph, around the categorizer, and this is the actual feature to get it inside of the system. I'm aligned with that.
So that's cool. So then my question then brings this back around. This is the work we're focusing on now. So we should get that in progress, and we should just have a perspective of how it... When we think we can complete this and how it'll inform...
So it's going to directly inform the circuit categorizer, but does it inform the refactor work? This reactor work feels like something complete.

**Nicolas Berrogorry | 10:42**
That one... Sorry, that one, I'm sorry, it's done. I never pushed it, but I just need to push it and close it because it was a very small amount of work.

**Wesley Donaldson | 10:51**
Can you...? Great again, same thing, let's put a comment on it. My thinking is that if it's done and we haven't shared it yet, that's something that we need to... Even if it's a five-minute thing, just explain why.

**Nicolas Berrogorry | 11:05**
Yeah, the that one is a pretty riy one.

**Wesley Donaldson | 11:05**
We did great. Then what you're actually working on is really these two things in parallel. So the refactor to get to the circuit categorizer, you're having to do these research activities, and you're working on both of those in parallel.

**Nicolas Berrogorry | 11:21**
Hopefully, it doesn't take too long, but it's from what I've seen, it's not an easy one. So the explainer on that was the overview tutorial for that was like a forty minute, lesson from a guy that I already share that on chat. What I need to do is to see, like, how can I take the learning from that lesson from that guy on the Internet and see how we can actually create our own graph.
And by that, I need to first start to figure out what our graph should look like and then start trying to implement the graph itself.

**Wesley Donaldson | 12:00**
So let's not make this burdensome for you. I think the easiest thing to do is what you did before. Just do a to-do column. Just so we can keep track of what the steps are that you need to go through and actually deliver to complete that.
So if I can update that with a simple checklist... Don't worry about creating subtasks and everything, just a simple checklist so we can keep track of it. Okay? All right, that's pretty much it.
So other important things for the week. So reminder was raised in the round table as well. So we have Sasha and Slava who are going to be joining the team. I have a sync, not a Syk. I'm going to check up with Jeff tomorrow on how he wants to onboard those team members. He's doing an internal onboarding for them and just kind of what QE bridge is and how Xolv fits within that conversation.
Then the goal is on Wednesday for us, the three of us. Sam, of course, as he sees fit, is going to be able to have a conversation with them, and the expectation is just full transparency. They will complement, significantly complement, or replace the triage. The grounding work that Ruben and Florian have been doing with us. We shouldn't cut Ruben as absolutely part of the conversation.
But the expectation is that these gentlemen will be more available to us to be able to have that. No, like let down, let Nick like let us focus on building the PC, building the orchestration, but like the core science and the stuff that you're struggling with. Nicholas, let that be something that comes to us rather than us having to solve it all by ourselves.
Like, right. How do you actually, embed these circuits and truly understand them? Like that should be something that they can give to us, right? So that's pretty much the critical thing. The other thing that's I think we just need to be very mindful of is it's still an ongoing conversation of grounding whatever we're doing on those beautiful steps that are coming back.
So categorization like I think'm going to literally start putting the word step blah as part of the title name that we gets super grounded. So always keep in mind, what work am I doing and what step does it align to? That way we can always say, like, we're delivering against the step process that Jeff has provided. Speaking of Jeff, we back burnered it, but it did come back up in conversation. I'm going to put a couple more tickets around these, but Jeff did bring back up this idea of, hey, where are we with testing on physical hardware?
And the answer is. It was back burner. But he's asking for us to prioritize that again. So I'll pull those into the board, but the expectation is close out the work we're currently on and then we can maybe tackle testing on hardware as well.
But I'll get these proper tickets on the board for us.

**Nicolas Berrogorry | 14:48**
Everyone remembers that. He said that?
That's the least. Okay.

**Wesley Donaldson | 14:53**
I remember it so aggressively that I could probably go out and find where in the where in like the. You actually said it multiple times, but yes, you're but don't worry about that.
All right, so it sounds like we have a decent amount of work for us to tackle this week. Any concerns, anything that you're not sure about? I know, right? We're still figuring that out, but I think that's within the exploration. Not worried about that.
So beyond just can we even get a feedback loop working with them? Is there anything else that we're worried about?

**Nicolas Berrogorry | 15:26**
No, yeah, I'm not very sure. So we can definitely get a feedbacklu working with them. Do you know if these guys are, like, specifically quantum experts or like the new ones or they are like, machine learning, sort of like engineering?

**Wesley Donaldson | 15:40**
Yes.
They're engineers.

**Nicolas Berrogorry | 15:48**
How are they?

**Wesley Donaldson | 15:48**
The way that... It was positioned to me. They're Florian-level data scientists.

**Nicolas Berrogorry | 15:54**
Okay. That's good.

**Wesley Donaldson | 15:58**
All right, apologies. I have to jump into a client meeting, but I think we're good here.
I'll just. I'll message in the chat and I'll get these kind of built out, the ones that are that we just talked about on the board for you, Nicholas.

**Nicolas Berrogorry | 16:09**
Amazing.

**Wesley Donaldson | 16:09**
Thanks, guys.

**Nicolas Berrogorry | 16:10**
Yeah.

**Dominik Lasek | 16:11**
Thanks.

**Wesley Donaldson | 16:12**
Bye for now.

**Nicolas Berrogorry | 16:12**
See you.

