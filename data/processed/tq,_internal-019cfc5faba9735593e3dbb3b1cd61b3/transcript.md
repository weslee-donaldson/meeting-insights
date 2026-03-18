# TQ, Internal - Mar, 17

# Transcript
**Nicolas Berrogorry | 00:00**
And I check it out.

**Wesley Donaldson | 00:02**
We meet again, it's got RGB baby. That's how you know it's going to work.
When in doubt, how many RGB likes does it have?

**Nicolas Berrogorry | 00:20**
Here are three lights. [Laughter] Red.

**Dominik Lasek | 00:24**
Green and blue. [Laughter] Exactly.

**Wesley Donaldson | 00:29**
Alright, all right guys, let's jump in.

**Nicolas Berrogorry | 00:29**
You know how to you quantum scientists to know that. [Laughter] Yeah, got timid.

**Wesley Donaldson | 00:37**
I am not going to bother you for the comments on this.

**Dominik Lasek | 00:39**
No. Sorry, I was super busy today with trying to understand those rag and embeddings and sotera, so.

**Wesley Donaldson | 00:43**
It's that important?

**Dominik Lasek | 00:47**
Yeah.

**Wesley Donaldson | 00:48**
I'll update that because I think the people who are looking are people like me, so don't worry about it. I'm clear where it is. Ignore that.
That's my miss for not fixing that for us.

**Dominik Lasek | 00:54**
Okay.

**Wesley Donaldson | 00:57**
Two things that we had from yesterday. There were both tickets for you, Nicolas. Just wanted to make sure you don't have to look at it.

**Dominik Lasek | 01:03**
Hey.

**Wesley Donaldson | 01:04**
We don't have to read them right now together as a team, but I did document out... Weird. I did document out the workaround the actual research of the RAG approach as well as the stress testing.

**Dominik Lasek | 01:15**
Yes.

**Wesley Donaldson | 01:16**
Based on what we saw in that open-source TA could pass, this is super relevant to what we're doing.
So great find, so that you just need that additional time.
So good on that is your status and not worried about it. I think my question to you is for Ruben and what we're talking about. Ruben put a recommendation. Asked for us to meet at 06:00 pm or 7 pm this Eastern time, which is like 4 pm, which is like 2 am in the morning for you. I'm going to record the session. I assume that you did not want to attend at 2 am. Just...
If I'm wrong there, let me know and I can invite you for your 2 am meeting.

**Dominik Lasek | 01:55**
No. It doesn't sound like something...

**Wesley Donaldson | 01:57**
Yeah, but if there are specific things there that you think you'd want to have Nicholas communicate...

**Dominik Lasek | 01:58**
[Laughter].

**Wesley Donaldson | 02:04**
I'd say, "Please share it with Nicholas. Nicholas, just make sure you..."
Sound like you're already messaging in the channel. So you're already aware of this. I should have a plan of where we were relative to our last conversation. That's my worry with a Ruben type character. He's a professor. You could feel that he wants to teach it.
So my professors used to want me to be like, "Hey, did you do the thing we talked about?" So just...

**Nicolas Berrogorry | 02:25**
Yeah.

**Wesley Donaldson | 02:25**
You're aware of that? With that preamble, I'll give you guys status. So, Nicholas, your first... After we know the top two.

**Nicolas Berrogorry | 02:36**
Okay, as you saw, and I thank you for bringing this work to... I've been working on trying to understand where we're standing with a secret similarity and all of that. I found all of that material. I am taking a look at what they are doing, and I'm trying to understand not too much because this is something that I want to bring up to them, to you and Ruben, and to everyone on their side, actually.
Okay, now that we know that something like that exists, how do we differentiate? Like what should we be building versus what should we be integrating? What already exists? We shouldn't probably try to reinvent the wheel if their work is MIT for example, we can use it for commercial, no problem.
So that's my main worry. My main new third point to raise.

**Wesley Donaldson | 03:34**
Yeah, I wouldn't be worried too much about that. I would say, "Focus on being able to bring the thing in. If there's a license requirement, let's not make that be something that we spend our time thinking through like they are funding."

**Nicolas Berrogorry | 03:46**
Okay, cool.

**Wesley Donaldson | 03:47**
They can get a license that we need if we need to have a... What is a comparable?
They have access to that comparable assume. So, just find what you think works well for the research exploration you do. Don't spend your time thinking about licensing please.

**Nicolas Berrogorry | 04:01**
So, okay, so then I need advice, because I am regarding researching and finding stuff. I'm flying, I'm finding a lot of stuff today. Specifically, I researched a lot about the first type of circuit that we agreed to try out with Ruben, and I am right now about to start doing tests with that type of circuit. I understand it way better.
It's a short algorithm. I don't know if I should stop researching now and prepare some sort of demo or some sort of cool demo like we've been doing, or if I should continue researching and hit them with just words.
Right?

**Wesley Donaldson | 04:52**
No. So sorry.

**Nicolas Berrogorry | 04:54**
Because... Yeah.

**Wesley Donaldson | 04:55**
Let me answer that really quickly. Sam's direction to us is to bring tangible, to iterate and bring tangible. So I'd rather identify a small circuit like X number of circuits X number and then be able to talk to them about where we are and then say, "Here is the next set of things that we can do and let them steer the conversation, right?"
So I would say if you've come to enough research to get you through, I can generate some value and have a conversation. I'd rather we do that and let the Rubens the future Sass of the world. Let steer the conversation of how deep to go.

**Nicolas Berrogorry | 05:32**
Okay, so I have. Regarding that, I have a couple of things that I can work on. I need to go check against chef document again just to make sure that because the more we align more parts like more parts is better.
But my idea of something that I could do is. Bring to something. To the UI or to the system itself. Like just like we have a drop down for the pipelines, get a dropdown for the data sets, for example, or the sample circuits and be able to select from that dataset on the circuit input. That will be really helpful.

**Wesley Donaldson | 06:16**
Okay, this is hard.

**Nicolas Berrogorry | 06:17**
Then if I do that for the shore algorithm, I meet ruin there as well.

**Wesley Donaldson | 06:26**
Hold on.

**Nicolas Berrogorry | 06:27**
Yeah.

**Wesley Donaldson | 06:28**
I want to make sure for you specifically because, let's be focused, let's target what we're trying to deliver. So you're working on multiple streams concurrently?

**Nicolas Berrogorry | 06:34**
Okay. I need to. Yeah, I need advice on that because I need to. Like, if we want both to bring some, new addition to the software, some increment to the software itself.

**Wesley Donaldson | 06:40**
Yeah, so...

**Nicolas Berrogorry | 06:47**
Like, there's many areas where I could.

**Wesley Donaldson | 06:51**
Exactly. So the categorization was the last major thing that we're working on because it informs queuing and placement. That's the last major theme we're working on. Before you were supporting RAG, I think we need to close that out.

**Nicolas Berrogorry | 07:02**
Yeah.

**Wesley Donaldson | 07:04**
So as part of that exploration of categorization, you looked at just these different circuits that we can create. So that's a third stream. So in priority order, all these are valid but in priority order, my question to you is what is closest to completion?
What is the closest to us a decent chunk that we can share? Is it the categorization? It sounds like the number of circuits, the divergence circuits, and the variation of circuits are pretty close.
Then there's the RAG. So of those three, which is closest to a chunk of a piece that we can present and get input on?

**Nicolas Berrogorry | 07:42**
Can you clarify both, on what you mean. But the, large, you good test.

**Wesley Donaldson | 07:50**
So you're doing this research.

**Nicolas Berrogorry | 07:52**
Yeah.

**Wesley Donaldson | 07:54**
The ticket that I created for you yesterday. Based on our conversation yesterday, as part of that, you identified this open source that had like multiple tools. One of the things you shared that you had lovely. One of things that you shared that you found was like these 30000 circuits, right, more than supply that we have, and they're real circuits.

**Nicolas Berrogorry | 08:09**
Which appeared to be 2000 from what Dumo was able to download but yes.

**Wesley Donaldson | 08:16**
So that is, in my mind, one clear deliverable. We now have more circuits that we can do a thing with and present that. That's one deliverable, a clean present that...

**Nicolas Berrogorry | 08:25**
Okay.

**Wesley Donaldson | 08:26**
Put that aside. The next thing that we have we've been working on is the multiple circuits, and work here falls within that. To get to that, we had to understand circuit categorization.
So that's another thing that we're working on. I think I need you to just get... I'm not going to answer it for you, but I need you to get to what can we demonstrate on circuit categorization as another clear deliverable.
Again, I know they're all related, but what is chunkable enough where we can get input, present, and get some input on? I would not... You drop down into the UI. It sounds like another distraction for us.

**Nicolas Berrogorry | 08:56**
This is really helpful.

**Wesley Donaldson | 09:00**
Let's just focus on getting one of those two things, or both of those two things, in a good place, and then in conversation we can talk about... In support of DUM, we could talk about what research you did relative to RAG, but your two core things are the number of circuits, the categorization, and then you're supporting DUM, and then anything else... We can get to that later. Agreed.

**Nicolas Berrogorry | 09:22**
Okay, yeah, I can bring... So when you mean... Let me clarify when you mean... Let's bring this to them. Do you mean as an increment in the software itself?

**Wesley Donaldson | 09:36**
Ideally, yes, but that's not...

**Nicolas Berrogorry | 09:38**
I okay, I yeah, I can totally because if it's not a hard requirement, I can either continue work, continue researching this week or implementing this.

**Wesley Donaldson | 09:39**
That's not a hard requirement. I'd rather us...
No, that's maybe part more that...

**Nicolas Berrogorry | 09:50**
So I think that I can... Okay? I can make it happen. I think because the... I think that I can get some type of circuit categorization working with the knowledge that I already have.

**Wesley Donaldson | 10:04**
Perfect.

**Nicolas Berrogorry | 10:05**
I can definitely show in the UI selector for the different ST samples that we found.

**Wesley Donaldson | 10:10**
Perfect.

**Nicolas Berrogorry | 10:11**
I probably should be able to demonstrate running the short algorithm and validating that it produces the right result. Those would be like beefy things to give them good...

**Wesley Donaldson | 10:19**
Do nothing else, please, for the next two days, we'll do nothing else, okay?

**Nicolas Berrogorry | 10:27**
I am... Look, consider me... Loed in.
Yeah. I'll shut up now.

**Wesley Donaldson | 10:32**
Right now. I'm over to you.

**Dominik Lasek | 10:38**
Yeah, so, too many things, rack system. I found out that it works in the meaning of working... But the embeddings actually aren't really good, I would say.

**Wesley Donaldson | 10:48**
Three. Go. Yeah.

**Dominik Lasek | 10:57**
So, yeah, there are four layers that we have explained in the Nichols read me, and I've vectorized all of them, but it seems like they don't work correctly. They don't show them the correct similarity.
For example, when I have just one cubit circuit, it finds me seven cubit circuits, which is 51% of similarity, which is totally bullshit. But I decided to debug more about that. There is one of the layers which is the most complex is the WL structure. I'm not going to explain what it does, but I created a UI for that to help me to debug what it does, how it works, what kind of data it uses, and so on.
So, yeah, I'm still digging into the embeddings and...

**Wesley Donaldson | 11:56**
So this is good? That's exactly... Again, guys, we're exploring. So this is good. So be able to present that raise the challenges you're seeing and your next step on evolving that and let's get some input from the team. There are not a lot of folks per the last round table that have experience working with RAG, but when we get these additional estimates, maybe they can contribute.
But just being able to present the conversation and open it up, I think that sounds like we've made good progress on that.

**Dominik Lasek | 12:21**
Sure, IW what.

**Wesley Donaldson | 12:23**
To Brian's feedback and what's inside of Jeff's document. Just like, "Why are we doing this?"

**Dominik Lasek | 12:29**
They don't know why we do that? I'm sorry, that's a joke.

**Wesley Donaldson | 12:31**
No, they... They should...
When you present the demo, just make sure you're grounding. Here's the why of it.

**Dominik Lasek | 12:37**
Yeah, sorry, I'm just, you know, I'm not a good speaker, and I just want to, you know, work in silence down than speaking. But, one question. Tomorrow we have AI round table thing meeting, right?

**Wesley Donaldson | 12:47**
Eight.

**Dominik Lasek | 12:48**
Which is the biggest one?
Like the monthly thing, I would say it's going to be demo tomorrow or on Thursday, like regular... You're not invited, or so I have... I have a...

**Wesley Donaldson | 13:00**
Let me check my calendar. That doesn't... That sounds familiar, but for a different project. So let me check my calendar, and unfortunately, I have to run to a client meeting, but so are we...

**Nicolas Berrogorry | 13:08**
Yeah, sure.

**Wesley Donaldson | 13:10**
Just give me a yes or no. Are we clear on what we're tackling for today and how that's going to talk into go into this week's demo?

**Dominik Lasek | 13:17**
I think so.

**Nicolas Berrogorry | 13:18**
Yeah.

**Wesley Donaldson | 13:19**
Good.
Nicholas, you have multiple things, so you're good as well.

**Nicolas Berrogorry | 13:19**
Yeah.

**Wesley Donaldson | 13:22**
All right, thank you, guys.

**Nicolas Berrogorry | 13:23**
Okay. Is.

**Wesley Donaldson | 13:25**
A for now.

