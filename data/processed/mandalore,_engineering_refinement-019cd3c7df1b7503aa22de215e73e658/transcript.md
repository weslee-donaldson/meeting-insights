# Mandalore, Engineering Refinement - Mar, 09

# Transcript
**Wesley Donaldson | 00:05**
Test. Okay. Can you guys hear me now?

**Antônio Falcão Jr | 00:16**
Yes.

**Wesley Donaldson | 00:17**
And I can hear you perfect.

**greg.christie@llsa.com | 00:19**
Great. Yeah. I don't think back then I had anything specific to add. The only thing I'll say is the one likely what we're aiming towards with you... Just to give some overall context of this conversation is getting the work actually starting to roll this out by the end of March should really be the goal.
We can... The way that we can do it is just by... This is something Stacy and I talked about with marketing is we'd start by maybe just pointing a small percentage of traffic into our new checkout flow right away from heart health, maybe something like 10% should be our goal in this month.
Then from there and have a plan to progressively send more traffic till we've cut over completely. So... But that's all just to say that I think the overarching idea should be that we're working towards getting our VP out the door by the end of this month.

**Wesley Donaldson | 01:19**
Okay. In line with that, I think I'll be honest and say that we haven't necessarily brought that date to the architecture conversation. What the downstream impacts are to align to that date...
He heard that very clearly. Greg, did you share something similar earlier? So we will take that into architecture and just talk through some of the... We had about four epics around order ingestion and order integration. Obvious, we just need to do a little bit of thinking and planning around getting to that date. Speaking of order ingestion, we do have this again primarily 99% engineering focused. I'm going to ask Antonio just to do a high-level walk-through and what our thinking is.
Then I can talk through some of the tickets that are aligned to that and just leave us open for questions. My expectation is to... This is the heart of this week's effort, two things: cleaning up MVP and cleaning up any outstanding related commerce observability, reporting event errors, and then working on having the engineering team work on ingesting the orders. We think there are probably three engineers that can work on this epic.
So we cannot necessarily have everyone work on this to get it to go fast, but we think we can push this up to have three engineers concurrently work through this. Tony, do you want to just do a quick walkthrough of the high-level thinking of how this will be accomplished?

**Antônio Falcão Jr | 02:45**
Yeah, absolutely. Let me share my screen real quick.
Okay? I think you guys can see my screen, right? I'm going to just walk through these high-level components. We're going to need to accommodate this ordering ingestion.
So, from the recurring webhooks, the idea here is to use the stream, the recurring webhooks, as a stream of data through our system. For that, we're going to have a dedicated web API gateway. The most important component on this phase of the work is this Lambda that will pretty much validate the signature just to make sure that we are compliant with the security level, the minimum secret level, and based on the webhook as a notification, we're able to reach the recurring API for data hydration.
So we're going to pull the information we need for Rick Curly in order to persist in our current DB. I specifically stream to these events from recurring. The idea is to separate the events that come from recurring from the events that we're going to use for projections and reactivity in our system through an ACL, and this phase is phase two. Basically, we're going to have a current connector to the current stream, and those events will be translated and transformed into domain-specific events through this ACL component, and we're going to then store them in a specific stream event stream on our current DB so that from that domain specifically stream, we can then react or consume to project information.
Then we follow the standards we have. So read models in Aurora and then Supergraph to consume those projections.

**Wesley Donaldson | 05:12**
Cool.

**Antônio Falcão Jr | 05:13**
Any questions?

**Wesley Donaldson | 05:23**
So one thing that we want to get ahead of as part of the epic 1.2. I can share my screen. One thing we want to get ahead of, and this isn't the second epic, but we want to get ahead of understanding what some of the downstream needs of the system are.
Maybe we can have that be part of the requirements and the thinking before we actually get to the point where we need to necessarily build a projection specific for BI as an example. So one task in here is this idea of understanding what the specific BI requirements for commerce are that we want to ingest and support. We don't necessarily have to build out the reporting or dashboarding, but we definitely want to get clarity on what those insights would be.
Then we use that as part of how we build out projections and how we support future projections. It's a similar idea behind the instrumenting of Century. Once we have clarity on what we think is important for us to be monitoring, beyond just the basic lab ingestion of all various events like what specific things we think we need to use those to inform our implementation as opposed to just waiting for them to happen downstream.
So, as Antonio says, a lot of core things there around the basic API gateway. He mentioned the importance of the webhooks, the validation of the kitchen layer. He mentioned the hydration need. So all those are accounted for in the epic. We, as a team, got together and did an initial complexity and effort around each ticket. We have not completed the assignments, but there is a bit of a not breaking, but an important conversation that we need to have, and we're looking to have that as part of the architecture meeting tomorrow. Specifically, we met earlier today, and we were just a full credit to Rinor and to you, Elvi, with the help of Jervy, of course. Just looking at how we've implemented or how we plan to implement the commerce, the order flow. The question of who is the system of record came up.
So who system of record, and that's the document if you came early that we were... I was just looking at that talk about how Rick Curley recommends that we integrate the system we implement the system.
So that led to a bit of additional clarity being needed, so we're pulling that into the architecture meeting tomorrow. However, even with that clarity being needed, there's still enough surface area for us as a team to start doing some implementation.
So we've identified the first couple of tasks that we can actually start working on tomorrow morning, which we will be assigning up after this call. So as I said, this is a little unusual. This is a very engineering focus.
I will open the floor. Maybe... Anyone from the engineering team have additional questions or uncertainty, please flag them now. But as I mentioned, important takeaway, there will be another opportunity for us to kind of sync as a team on just finalizing architecture, but not blocked by that conversation.

**Stace | 08:35**
No. I think that sounds right. The top part of Antonio's document right from web hooks to Recrly API hydration. That is going to be what it is regardless of the rest of the discussion, as you called out.
So I think... Yeah, soon. The sooner we can get started on that, the better it will be to start picking up that data once we've got it in our system from Recrly.

**Wesley Donaldson | 08:59**
Sounds good. Okay. We had originally as a team, just looking at the effort and syncing we were projecting out. I'll hold that conversation after the architecture, and maybe for a smaller group, but generally we have clarity. We have enough surface area for multiple team members. Even out of the order, we have surface area for team members to just help with cleaning up all MVP content and some additional refinements around just some older events or observability tasks that we want to close out as well.
So the team should be fully utilized this week if there are no additional questions. Does any engineer have any concern that they'd like to raise as any business owner? Have any additional priorities I'd like to share?
If not, we can give folks a couple of minutes back.
Okay? All right, good folks. Thank you so much. We will... We most likely will get in some additional ticketing around features within the commerce experience and front-end user-facing features, but we don't have those just yet.
That's expected. So we'll probably do the refinement on that by virtue of the product app... We probably will not have those in this meeting for today or for tomorrow, but we may see a few additional epics come into this team depending on availability and depending on what product is able to share with us by midweek.

**Stace | 10:36**
Greg... We should get with Christian. Probably pull you all of us in at this point too. We need to pick up that data model event storming discussion where we started, right?
I think we outlined several different objects, and we need from a business rules and product point of view... What's the life cycle of each object? What are the states? Remember?

**Antônio Falcão Jr | 11:05**
Yes. I do have a meeting this week already on the books for some of that conversation. Okay.

**Wesley Donaldson | 11:19**
If possible... If we could maybe invite Antonio... I mean, obviously, you guys know... But just to try to give him more ownership of understanding the full breadth of the system.

**Stace | 11:29**
Yeah. I mean, probably the next discussion after this one is where we'd want to go in. We're still talking about business decisions ahead of implementation.

**Wesley Donaldson | 11:41**
Cool. Space. If you want, we can use the next ten minutes in this meeting since we have a lot of folks that may like to inform any other conversation you may have. Or we can give folks time back.
Okay, everyone, enjoy the rest of your afternoon. And Tony, we're going to ask you to maybe hold the line. Let's do the assignment stuff now.

**Antônio Falcão Jr | 12:08**
Yeah, sure.

**Wesley Donaldson | 12:10**
Thanks, guys.

**Antônio Falcão Jr | 12:12**
Thanks. Have a good one.

**Wesley Donaldson | 12:20**
Cool, hold on, let me stop the recording.

**Antônio Falcão Jr | 12:22**
Okay?

**Wesley Donaldson | 12:32**
Okay? Normally more talkative in these meetings, aren't they?
But all good. Okay, so make sure... Yep. So I think I mentioned this to you before, I have two competing priorities. One priority is the direction that I need to have LC team members understand how the ordering process works and own it because the obvious is that it's their company, it's their... They should be the ones that understand it most.

**Antônio Falcão Jr | 13:02**
Right? Yeah.

**Wesley Donaldson | 13:03**
But at the same time, I want to make sure I'm a member of our team. I think you know what I mean by that is close enough to the work where we can jump in, we can provide leadership, we can be not owners, but close enough where we could be owners.
So you provide much of that role, but I would like an engineer to be along for the ride.

**Antônio Falcão Jr | 13:25**
Okay. Makes sense. I see this strategy.

**Wesley Donaldson | 13:28**
So to that end, when you had said to me how you yourself in the last architecture meeting there was no pushback...
I think my worry there is if it's me how great... But is it me how in Germany? Is it me? How? In Lance, I get the five that Lance is closer to some of the backend-specific stuff, but him and Jeremy are basically interchangeable, so if you have a preference... I'm not sure how much you work with each of them, but if you have a preference, I would support that.
So it sounds like you, Lance, Jeremy, and me. How are the resources? Is that what you're thinking?

**Antônio Falcão Jr | 14:04**
It was. But I will count on your knowledge or expertise on the team for this one because I have more interactions with me. But that's why I asked for him. But there is no restriction.
So I completely open to take your suggestion on this one.

**Wesley Donaldson | 14:26**
Yeah. I think Meha has been taking a lot of...

**Antônio Falcão Jr | 14:31**
Yeah. [Laughter].

**Wesley Donaldson | 14:32**
I feel like that's not going to go away for the short term. So I want him. I don't mind him being close to the work, but I almost feel like he needs to be made available to deal with the things that will catch on fire.
So, I was actually... Mind if you...

**Antônio Falcão Jr | 14:48**
Makes sense.

**Wesley Donaldson | 14:49**
If you were insistent on me how, for whatever reason, I would support that because you're the architect and I respect that. But if you weren't strongly in favor of that, I would actually propose maybe Jira go and inspire with Sam on thoughts on who's a good fit for this. His perspective is everyone from Zovio. Every engineer from Zovio should be able to do this work.

**Antônio Falcão Jr | 15:12**
I absolutely agree. Yeah, I know no specific reason. So we are good to move with.

**Wesley Donaldson | 15:18**
All right, let's say it's Lance, Jeremy, and yourself. Sorry, that's not true, let's try that again.

**Antônio Falcão Jr | 15:19**
Difficult? Y yeah.

**Wesley Donaldson | 15:26**
Lance, yeah, yourself. I was right the first time.
All right, let's help me divvy this up. Screen share.

**Antônio Falcão Jr | 15:32**
Yeah, that's correct.

**Wesley Donaldson | 15:40**
Okay, so the gateway is fundamental. Who knows CDK the best that I am aware of? I guess that could be anybody. The validation webhook. Configure... To deliver all events. This feels like a Lance opportunity for him.

**Antônio Falcão Jr | 16:00**
It is. Yeah, it is.

**Wesley Donaldson | 16:02**
Dead letter queue maybe Jiffco, validate webhook authentication. I feel like that's the same thing as the recurring, so that's Lance's gateway entry.

**Antônio Falcão Jr | 16:14**
Makes sense.

**Wesley Donaldson | 16:17**
So this is setting up the... This is all circa DK. I'm going to say you for now. Hold it, let's hold a thought on it instrument... They just... This is your Elvis.

**Antônio Falcão Jr | 16:23**
Okay.

**Wesley Donaldson | 16:29**
I like this for you, Elvis, simply because he's like whoever owns reporting and event monitoring needs to understand how the entire system works by virtue of having to set that up.
So I think that gives him connectivity to all of that. You're already on this event schema. This is whoever, so this could be Jiffco's not balanced yet, so maybe that's Jiffco. Actually, no, that's a fail.
So this needs to be Lance because this person needs to understand CDK, right?

**Antônio Falcão Jr | 17:03**
Yeah. I would... Catch... Yeah.

**Wesley Donaldson | 17:05**
So then this has to be Jiffco just to balance the team. I created two of the exact same tasks. Jesus Christ, why didn't I create two of these? This is the prep work. I did this yesterday. My God, sometimes I do so many things so quickly I forget what the fuck I did. I'm going to leave this.

**Antônio Falcão Jr | 17:36**
[Laughter].

**Wesley Donaldson | 17:44**
Okay? So going back to 1.1, let's look at it again. Event. So this is unknown. I'm going to make this a 5 just because
it's going to require a lot of investigation, so this needs to be schema review, blah. Yes. Okay, what do you think? The architecture of all this because he's going to have the convert lead the conversation there.
It's just what we talked about already, all these points actually. I should do... I should throw this document on that.

**Antônio Falcão Jr | 18:18**
Yeah.

**Wesley Donaldson | 18:34**
Okay, cool. So that's good then. Jiffco owes the payload hydration, which needs the webhook, which so Lance is getting the webhook ideally in the web of... I don't think it's a hard requirement for those things to be the same. How many do we have? We have 123123.
Okay, that's fine. Then you have the migration blue, green, you're already working on that. How much effort have you put into this already? 07:14.

**Antônio Falcão Jr | 19:13**
I have it almost done. Yeah, I just need the DNS part now, but yeah, it's the code work on this side is done already.

**Wesley Donaldson | 19:20**
Yeah, okay, I was trying to see if CO could take that just to help understand blue-green a bit better, but that's fine.

**Antônio Falcão Jr | 19:25**
Yeah, we can work on them in parallel, but in order to validate the landing, we're going to need the gateway for sure.

**Wesley Donaldson | 19:32**
That's used the... So the Lambda that you mentioned the Lambda sits in... No, the API gateway has to be first and then the Lambda.
Exactly.

**Antônio Falcão Jr | 19:56**
But it's possible to start the Lambda even before the gateway is ready just for record, okay?

**Wesley Donaldson | 20:03**
So the validation is the Lambda for me. Hold on, just the...

**Antônio Falcão Jr | 20:10**
Well, when I mean validate, it is to functional test it or to test it sorry to avoid...

**Wesley Donaldson | 20:17**
No, what I'm trying to do is just make sure that I don't... I'm not missing any work, so that's what I'm trying to do.
So I think I believe this. My thinking of this web hook to validate authentication, durable storage. BH Blah. This is this guy.

**Antônio Falcão Jr | 20:31**
Correct. He's part of this guy's work. Yeah, because I was assuming that this specific element will either validate and pull data from... Because these specific authenticity validations are not a deep work.
It's not a hard work to do. So it's not about to check the consistency of the key we don't need. In my opinion, we don't need a lab adjustment to do that.

**Wesley Donaldson | 21:11**
So that's all this does currently. So if we need another ticket, then so that's just the validation, literally, it's all it does. So what am I missing then? So we have the ability to validate. How do I get this back to the original order? This is it.
Okay, so we the API comes in, we do the validation to get to... This is now smaller, so I'll make this smaller.

**Antônio Falcão Jr | 21:32**
Okay, it is a smaller API, correct? With the proper resilience, right? Because it includes pulling the data and includes that letter in case of failure and retries first and that...

**Wesley Donaldson | 21:39**
Configure recurrly delivery all event stores into the ingestion point. Configur so this is on recurring. This is just stuff that they need to do. I don't think this is this big.
So this is on re Curley's and dead litery. So it's missing. Something here is missing the actual processing of the web hook, right? We have this we have a validation lambda that just make sure that we can actually accept the information we want. We have the web hook coming from recuurly.
That's all still here. And then we're missing the great take the data and push it into current. So no, this what any is.
Okay, so this, ingest so this is a lambda and this is ingest web hook data into current, is that what it is?

**Antônio Falcão Jr | 23:02**
It is, yeah. In the ingestion webhook, we consider that this ingestion is resilient. That includes retries and that letter on this work.
Yeah, it is the high order.

**Wesley Donaldson | 23:15**
But that the dead letter is a separate task, but it's still right here, basically. So we still we now have this ingest. So API comes in validate does validate it makes sense sorry, configure recurrently to have the events.
That's first, get the API gateway. Second, validate the web hook. Like that's all part of the LLaMA de letter que is part of the resilience for is part of the resilience for the lambda ingestion. So these two are very the same.

**Antônio Falcão Jr | 23:47**
Correct?

**Wesley Donaldson | 23:50**
Century is just Century. The migrate we already have that this is a secondary... What is it? Recurring webhook payload validation is part of this. These two tickets are the same thing, but they're separate steps.
So this is one Lambda for... Sorry, this is one LLaMA for getting the webhook and responding to the webhook. This is another Lambda with... Maybe however you guys choose to make this be called. Is it just this LLaMA invoking this one, or is this a separate one that gets run on an event?
Is this run on a schedule that I'm not clear on here?

**Antônio Falcão Jr | 24:27**
Let me put it this way. Let me show you actually the diagram just to...

**Wesley Donaldson | 24:33**
Well, then we have it right here. So let me just put it over here for us.

**Antônio Falcão Jr | 24:37**
Okay, good.

**Wesley Donaldson | 24:46**
Love this feature in Chrome by damn time they added that. Okay, so...

**Antônio Falcão Jr | 24:54**
So my understanding is for every webhook, consider that webhook is API-based, so... Recurly will basically invoke a Lambda with instance. So my understanding is we're going to have a specific Lambda instance running for every webhook call.

**Wesley Donaldson | 25:18**
Really, what's the difference between these different events then?

**Antônio Falcão Jr | 25:18**
I do think so.

**Wesley Donaldson | 25:26**
I mean, I guess I'm curious about what's the difference in these events.

**Antônio Falcão Jr | 25:26**
I'm sorry.

**Wesley Donaldson | 25:30**
Why? Like, why do we need a separate instance for each one?
Maybe that's just the design pattern that we have.

**Antônio Falcão Jr | 25:44**
We don't need it. It is not about that. I don't think that we're going to have all these events being all these hooks being called at the same time, per se.
So I imagine they will follow a business flow. One we call first, and then the other one, and then we end up ingesting one by one. But do you have a different perspective on this?

**Wesley Donaldson | 26:11**
No, I'm not qualified to question you in the architecture of this, by the way.

**Antônio Falcão Jr | 26:16**
Nope. It's more exchanging ideas.
Yeah. But my understanding is one call at a time. But obviously, it's going to be the very same LLaMA. For sure.

**greg.christie@llsa.com | 26:25**
Yeah.

**Wesley Donaldson | 26:27**
Okay, so it's LLaMA that ingests webhooks, per 4 data that's terrible English. Okay, and you're saying that you... This is going to be multiple Lambdas per event, so this needs to be multiple.
Okay, all right, let's keep going. So we have the Lambdas that are where we're here so right here now we... So it's multiple validators or is it one validator because in theory, the hash signature would be the same across all of them should know the data.

**greg.christie@llsa.com | 27:15**
Yeah.

**Antônio Falcão Jr | 27:15**
It's the validation.

**Wesley Donaldson | 27:17**
Go ahead.

**Antônio Falcão Jr | 27:20**
It is pretty much a function routine. It's not even a Lambda. It's just a function routine to make sure that we are consuming from the proper sender.

**Wesley Donaldson | 27:24**
Yeah, it's...

**Antônio Falcão Jr | 27:33**
Then once we pass this step, we are good to hit to reach the API recurring API for hydration.
So in my understanding, it's all on the same Lambda. We don't need separate data Lambdas just to validate the signature and pull data from recurring.

**Wesley Donaldson | 27:54**
So that that's the part I'm. I'm struggling here because finding a logical way to break out the work... So if this is literally... This is a function, this is a method inside another function inside the same... Right? These all should be... These three tickets should be one engineer then.

**Antônio Falcão Jr | 28:15**
Pass through them again. Sorry, I lost your mouse. Show me again the three ones.

**Wesley Donaldson | 28:18**
Okay, so we have the LLaMA validator which we think is a function. We have hook itself that prop like a webhook, a lambda for each webhook, and we have within the Landa for each webhook, we have the hydration step or function within it.

**Antônio Falcão Jr | 28:24**
Correct. That's my understanding, and it depends on how we want to design it. We can have one lambda for all the webhooks, but I need to double-check if the code will not become too messy by handling all the lambdas in the same all the hooks on the same lambda.

**Wesley Donaldson | 29:06**
I think the guidance of... Let's learn from the lessons learned from Shopify, whatever Shopify is doing here is probably the right answer from a design pattern perspective.

**Antônio Falcão Jr | 29:17**
That makes sense. Let me double check that. Okay, I'll get back to you with that point. I'll take a look on sp chop pri.

**Wesley Donaldson | 29:26**
Okay, so right now, I'm assuming each one of these is an independent effort that... By independent effort, I don't mean a function.
I mean it's a separate lambda, it's a separate module. It's something that could be worked on independently of everything else. That's an assumption I have taken when I built out these tickets. So I guess my ask to you is, maybe you just take thirty minutes, look through it, and just give me a ticket number. Then, I think this is part of the same... Just help me. Help me break this back down because this feels too much... Right?

**Antônio Falcão Jr | 30:01**
Yeah, okay, let me do the work.

**Wesley Donaldson | 30:07**
Do you want to do that together, or do you want to just step back and get 30 minutes?

**Antônio Falcão Jr | 30:11**
Give me 30 minutes. I'll say a code just to make sure how we are handling those hooks.

**Wesley Donaldson | 30:13**
Okay?

**Antônio Falcão Jr | 30:18**
The design and then I'll get back for those breaking down and yeah, make this work because I believe now it's too granular. Let me double-check them.
But I believe it's true. Granular I don't want developers blocking each other.

**Wesley Donaldson | 30:35**
Ocean crushing each...

**Antônio Falcão Jr | 30:36**
Blocking each other? Yeah.

**Wesley Donaldson | 30:38**
Okay, yeah, take 30 minutes. I'm going to go eat something and then just send me a Slack or something or teams, whatever communication you like.

**Antônio Falcão Jr | 30:48**
Sure.

**Wesley Donaldson | 30:48**
Answer.

**Antônio Falcão Jr | 30:48**
Okay. Talk to you later. Take a break.

