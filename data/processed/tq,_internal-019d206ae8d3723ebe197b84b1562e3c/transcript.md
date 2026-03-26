# TQ, Internal - Mar, 24

# Transcript
**Nicolas Berrogorry | 00:07**
Good morning, how are you?

**Wesley Donaldson | 00:10**
I am good. It looks like Nicolas gave me a good auto pipeline, but all good. Cool. Alright, let me just share my screen. I think we're not going to have Nicolas joining us. But that's okay. We'll just be sad without him.
The head of a shear. There we go. Wait, and that's the wrong project.
Alright, so do we have a couple of tickets that we spoke about yesterday when the covers from the car? Nicolas, thank you for joining. From the conversation we had yesterday, there are a few exploration tickets around the pipeline specifically.
So Sam had asked for Dominic, for you to focus on auto engineers approach to the pipeline and then Nicholas focusing more on exploration around the other possible like using Google, so forth and so on.
So those tickets are on the board, but we'd agree that we would come to a closing out. We were trying to use yesterday to close out the ticket so we can start pivoting to working through the pipelines.
So maybe... Let's start with that. Nicholas, you want to go first and check something meanwhile?

**Nicolas Berrogorry | 01:39**
Can you go first time and checking something meanwhile?

**Dominik Lasek | 01:45**
Yeah, sure. Yeah, actually, I already started working on the auto engineering pipeline package as I described on Slack. I was able to successfully run this pipeline on my local. I created the package in the repository that I called pipeline to actually run the pipeline package itself and another package that's called the modules. I created the first implementation of the circuit input that actually has a command handler that triggers that circuit input and two events. One for success job and for failed job.
And yeah, I imported that to the pipeline and ran that. So I'm thinking I'm more familiar with the package right now, but yeah, still a lot of work in front of me. So yeah.

**Wesley Donaldson | 02:50**
Great. We have the original ticket for the Florence experiment. Obviously, this enables that. Do we want to keep them both in progress or...? Do you feel like this is a focus item which enables this or can they work together?

**Dominik Lasek | 03:06**
I think that I'm not able to work on both of them at the same time. I want to be more focused on the pipeline modules. But as I understand the Florence experiment running ticket, it's something that we should get as a thing in the new pipelines, as I understand from that.

**Wesley Donaldson | 03:26**
He.

**Dominik Lasek | 03:27**
So yeah, when I understand and the entire package, when I create all nodes as a plugin that we need, then I think I will be able to do something with that ticket as well.

**Wesley Donaldson | 03:40**
Okay, all good. Then the only other item on your plate was just coming to you... Ow, a comment just to close out this effort which we already demoed but just can... We effectively move this to done.

**Dominik Lasek | 03:51**
Sure.

**Wesley Donaldson | 03:52**
Yes, nothing additional to add.

**Dominik Lasek | 03:52**
Okay.

**Wesley Donaldson | 03:54**
Okay, all good.

**Dominik Lasek | 03:56**
I think I've...

**Nicolas Berrogorry | 04:00**
Yeah.

**Wesley Donaldson | 04:02**
All right, Nicholas, are you ready to go? You're able to go.

**Nicolas Berrogorry | 04:06**
So I have to do the same thing as long for a squid cr, research for a graph based rag, because I think I do have enough material to close it for now, but I don't know about the I mean, the acceptance criteria for this one is like pretty serious, let's say, but all of them.
Yeah. Seems like. Seems like I could close out. It won't be like the most like a deep response to each one of these points, but yeah, I could close it out. It's gonna take a little bit of time, though. By collecting everything that I research for the graph-based and documenting it.
Basically, I didn't follow our choice. I will do it for Thursday, but today I shall jump directly into the orchestration frameworks and all of that.

**Wesley Donaldson | 05:10**
Yeah, that's fine. So the project goal was to have something for Thursday or around the orchestration frameworks. So this is a cleanup task, and my worry is more just what has been completed and what remains that we can still do.
So don't focus on checking boxes already. I'm like, "Focus on getting something for Thursday." Then you and I connect, and I care more about what is outstanding that we think is valuable for us to do down the line. Not so much about just checking the boxes.
So don't...

**Nicolas Berrogorry | 05:38**
Yeah, okay, so down the line, there's a whole line of work with a graph-based basically, which is like another layer. Well, let's not call it layers and not confuse with the existing layers that we have in Drive, but it's another abstraction that goes alongside... That helps. It's basically used in enterprise usually to model knowledge in enterprise, and you can use it to model the architecture of the architecture, the taxonomy of the... Basically, it's a way to condense and to maintain and curate enterprise knowledge.

**Wesley Donaldson | 06:26**
Yeah, exactly like that's great insight, I don't think I don't want to make sure we don't lose strick of it. So your only other thing for you, Nicholas, is just you're always working on things that are kind of a bit of a follow up from Ruben.

**Nicolas Berrogorry | 06:32**
Okay.

**Wesley Donaldson | 06:38**
The last station I remember was around the variant producer.
Generally, as I asked you, are we clear on all the things that we were working with Ruben?

**Nicolas Berrogorry | 06:42**
Yes.

**Wesley Donaldson | 06:49**
So if we had another comp, when we have another conversation with him, we have everything we want to present to him based on his action items.

**Nicolas Berrogorry | 06:56**
So the last action item, he pushed me towards quantum research quite a bit more than that I was exploring.
Basically, he asked me to check how some of the math concepts from the paper were translating into the QM that we have. That is the only point that I'm missing. But all of the rest of the points that he wanted to work on, like the defects on the variant producer re-ent and all of that, have been mitigated. They have been actually taken into account, and it's working, and I can show him and all of that. I can show it on a demo or with him directly.
Yeah, that Rinor math follow-up is something that I should probably do as well. So I think that for Thursday, I have three items that I should probably tackle. Documenting and... So I'm trying to close out the uniform now. The graph-based... Now documenting my work with the orchestration frameworks and this math thing that I should probably take a look at.

**Wesley Donaldson | 08:16**
Sam, what are your thoughts around the orchestration for this one? It sounds like Dominik's task is built and using auto-engineer. So for Nicholas's test, since he's looking into alternative frameworks, do you think we should be targeting a POC for each, maybe two of these frameworks?

**Nicolas Berrogorry | 08:24**
No.

**Wesley Donaldson | 08:34**
Is it more just a readout of what the thinking was in the findings?

**Sam Hatoum | 08:39**
Then let's get some candidate ones that we'll want to test out and do some POCs on. Then, once we have two or three of those, we can try and replicate the pipeline using those and then see which one fits the bill.
If there's anything extra we get from those over auto-engineer versus just... It validates that we need to use auto-engineer at this point. Yeah, I think two things: get a short list, ask one or two. Let's do POCs, getting a couple of commands and a couple of things executed with it.

**Nicolas Berrogorry | 09:12**
Okay? Okay. Yup. I wanted to share. Maybe it's a good time to take 15 seconds, not too much, to explain the overview of what I found. Basically, when you do orchestration of any kind, it boils down to CRS theory.
Auto Pipeline is the only abstraction that I've seen that does that and allows for storing and lowering the events and doing a proper complete, secure event source implementation. So the other ones, all the ancient orchestration that I've seen are like CQRS without some parts.
The auto pipeline is a complete abstraction. That's my point of view for now.

**Sam Hatoum | 10:04**
It's that's what I found as well with researching this problem with the LMS to a crazy degree, like so far. And I just can't believe what I'm looking at. But you know, potentially I might abstract Pipeline out of Auto Engineer as its own package actually to run outside and that way it can be maintained.
So if this works out, I think I'll do that. And then we just import it into the auto engineer project as the. I don't know, we can call it like event source agentic event source agent orchestration or something like that.

**Nicolas Berrogorry | 10:34**
Yeah. I wouldn't like. My opinion is that I won't tie it to Asians because it's general. Like, it's a general framework.

**Sam Hatoum | 10:44**
Yeah, there's more to it, by the way. There's a lot more to it if you look at... There's a lot more in the realm of what people have worked on. So there's some work by... I think his name is Eves Loffren. Let me just go find it. Eves Loffren, use Event Sourcing Workflow Pattern. The Workflow Pattern here it is. I haven't actually implemented this yet, but Emmett does actually support it, and it's quite some flavor of it. There's a really good read, if anyone's interested, because there's a lot more to it. I've got some abstractions, but the Workflow Pattern is another fantastic abstraction, and this person has basically figured out how to do it in aetal fashion.
Then Oscar put his own... He was inspired by this theory, he created the implementation in Emmett, and actually uses Emmett. Okay, so there's a lot you can make durable processes to do happen to be does with the world to-do list.
It's not simple. If you look up a Mat Monk to-do list, it's just a very simple thing. It's basically you put a to-do list in a database and you keep knocking tasks off as they're done. That's how he does orchestration.
So there are a few patterns to do it, but it's all based on the same thing, events. So that's of truth. Okay.

**Wesley Donaldson | 12:15**
Sorry, team. Just one thing I want to make sure we just buttoned off for today, clarification of what we want we're targeting. Bringing to demo on Thursday is Sam. It sounds like Dominik's orchestration using auto engineer is a must.

**Sam Hatoum | 12:32**
Yeah, those are just something... I mean, bring the findings or say we've shortlisted to four different... There are four or five total different... If 4 is good, if you want to just find three, don't make the Niko that's good here. We've shortlisted to four different ones. In fact, even if you just want to find two good ones, that's okay.
So short list three, and we're doing some spikes with all of them. Here are the spikes. Here's the spike from auto engineering, and here's how we would use it. Ultimately, all of this is to support... How do we do crazy scale quantum experiment based on what Florian asks us to do?
That's it. We're building experiment infrastructure that allows us to test... Q that you know to use agents to drive to see how much error correction we can get done with... Florian has just given us clear instructions on how the experiment...
He'd like to run it, but it's a non-trivial process, like an orchestration level of stuff. Sam and Jeff and Brian spoke about this in an architecture segment, and here are the findings.
That's basically what we do.

**Wesley Donaldson | 13:47**
Excellent.

**Nicolas Berrogorry | 13:47**
Yeah, I can tell you from now, none of the frameworks that I'm looking at, they are all forents, and none of them have the scale in mind. They are for like short prompts that respond instantly.

**Sam Hatoum | 14:00**
You might want to expand your search... Agencies and look at more. I think there are a few others like not quite RabbitMQ but there are some other previous... Like old-school... Think like orchestration.
Okay, so look for those, right?

**Nicolas Berrogorry | 14:14**
Yeah, that's another... Okay, I do. Yes.

**Sam Hatoum | 14:18**
Just to chat with the GPTs, just out of the dimension agents, just say in a complex orchestration, I want to do things like scaptic, other patterns, things like that.

**Nicolas Berrogorry | 14:26**
Yes.

**Sam Hatoum | 14:26**
Yeah, that's what I do.

**Wesley Donaldson | 14:28**
Apologies. I have to jump to my client meeting.

**Sam Hatoum | 14:30**
Yeah, me too. You're good. Cool. Thanks. Nice to meet you.

**Nicolas Berrogorry | 14:35**
Thanks you soon.

