# LLSA, Engineering Sync, Recurly - Mar, 16

# Transcript
**Jivko Ivanov | 00:28**
Hey, guys. I haven't seen you since forever.

**Wesley Donaldson | 00:32**
[Laughter] How true. Alright, let's give folks a chance to join. We had a few accepts on this, so I'm expecting... I'll just copy it to the channel anyway. More meeting info. Copy items. Where's my teams chat?
We mostly... Everyone... Jeremy...
Can you please...? John asked... Okay, was Antonio as well.
Right? Nice. Okay, I'm going to get started. Perfect, I think we have everyone we need. Okay, so this... We're going to have a quick sync with everyone coming out of the conversation.
Tony and I have been having for a couple of days now. Specifically, what we're looking at is just... I want to talk through one of our high-level goals and direction that we have from leadership, and then I want to talk through all the different epics we have to get to that. Thanks, everyone, for joining us on the State of Integration document.
I think Sam's direction of "Hey, let's use this as our true progress report." Being able to check off green things is a really good call because it allows us to all be able to easily visually see where we are, and anyone can just jump in this diagram and see how the integration work is going.
So to that end, what is the core goal or objective that we're trying to hit? Stacey, to share the direction in the larger team direction that we are looking to be live with. 10% of our orders being taken through recurrently by the end of March. We're not going to do a load balance, we're not going to do any special configuration. We're effectively going to run with Shopify and Recurly concurrently.
If you think about the original document that we were looking at, we're effectively going to have a Shopify and Recurly both running in parallel where much some orders will be via social media, I believe, being directed towards the Shopify specific endpoint.
So the Recurly specific endpoint. While the majority of our orders will come through Shopify, just be aware that's how we're going to do the separation of recurringly and Shopify while they're both active.
That's not super relevant because that doesn't change the fact that what we're building as opposed to how many users are going through it. So what we're building is broken up right now into two buckets. There's the order ingestion,
and then there is everything in the back end behind that. I'm not going to go into great detail in every one of these because we all should know what those are at this point, but... You and I have basically broken down the tickets that are necessary and done some initial assignments to deliver that work. The challenge that we're having is we have a direction that we want to start seeing orders getting to the system for this week.
So being able to have orders flow to Krisp even if they're not complete... Sorry, correction. We want to have a connection into the various blocks within the system. If you think about the integration document, we want to have a DLQ, we want to have an QE-based system. We want to have the LABD just defined out.
If we're getting errors, we think about test-driven development. If we're getting errors in individual steps, that's fine, but at least getting the mechanism, the plumbing in place, and then we work through the individual one-off issues.
So that's one idea for us to be able to show that the system is connected, but we're still working through it to that end. As I said, we have a decent amount of tickets that support this. We have folks assigned to them, but one of the issues I'm seeing, honestly, is just the runway that we have. We had a lot of team members help out towards mid-February to get us over the hump of getting the MVP demo out.
I think for us, perception is that we should be able as this team alone without pulling in a significant portion of end-of-year should be able to get us to production because much of this is stuff that is relatively a known quantity for us.
So to that end, I want to just give us some space in this meeting to talk through. One isn't realistic to be targeting this week to get the pipeline hooked up, even if we're seeing some errors. Is it realistic to be getting orders into CSTAR with the understanding that we still have to figure out how to basically convert the orders that are now into the LLaMA and push them over to CSTAR?
So is it realistic for us to expect that to be something that we can accomplish this week? Then all of the necessary landas pipelines, mapping that are necessary to achieve that is that work properly represented? We believe it is.
If it is properly represented, do we have the right folks on it and do we have the right expectation of what they need to be able to complete the tasks right? That's a lot of words. So let me... I want to open the floor, and I want this to be more of a collaborative conversation.
Are we clear on what the high-level two important parts of high-level direction are?

**jeremy.campeau@llsa.com | 06:44**
8.

**Wesley Donaldson | 06:56**
Okay. I see.

**jeremy.campeau@llsa.com | 06:59**
I don't know if this is not represented by the work or if it's somewhere else, but well, so for right now, for Shopify, the way it works is there's a LLaMA that sends the data to an Azure even grid, and then there's a API attached to it that transforms the data and puts it in CSTAR, so I'm not familiar with how. Azure event. Kris set it, but we had to have help from Francis and I think Daniel Young to get that going, so we will need them to help set that part up.
And I don't know if they have to create a completely new one or if, you know, there's so I don't know how Azure Event Grid works since they did that. So that's like one thing that sticks out to me. That's like very unknown.
And you know, since it's time sensitive, we have to have that set up. I think you can probably work on transforming the payload from Recury into ChatGPT in parallel, since you could just set up a test with a block of JSON. My concern, though, is one thing: the way we map the items, like the line items from an order, is going to be completely different.
So that requires a lot of rework for that part. That's something that sticks out to me. But I think the other stuff, just as a knee-jerk reaction first look, should be relatively straightforward. A name's a name, and addresses are addresses, but the items are set up very differently.

**Wesley Donaldson | 08:33**
Much.

**jeremy.campeau@llsa.com | 08:34**
Obviously, it's two separate systems, so that might take more time.
I don't know exactly how we'll have to map them.

**Wesley Donaldson | 08:41**
People.

**jeremy.campeau@llsa.com | 08:42**
So that's what sticks out to me so far.

**Wesley Donaldson | 08:44**
Great. I hundred percent agree. That's kind of as a matter... I don't want to call it AP1, but it's a high P2, and that's represented in this ticket. Jeremy, we did so elect you as a person to that just because Lance is working on something very critical as well relative to what he's already working on. Something so targeting you for this work and full transparency. I really want you to start working on this AP. There are some smaller tickets that we got from product that I think are... There are still things that we need to do, but they're less important in my mind.
So I'm looking to move those off your plate in favor of you hitting this ideally pulling it into process today with the expectation that maybe tomorrow is your first heavy focus around this because this is going to inform pretty much everything else that we do.
So that's how we're addressing that mapping concern and the infrastructure concern. I had a ticket in here that I removed, but thank you for the clarity around getting that back on the board and having it be more of a Francis ownership to help with the event grid.
So I'll get that ticket on the board. Fine. Any other things like that is what I'm looking for. I need the collective brain here. So let's maybe have a quick conversation around ECOM 3. Again, this is... We're not... I want to be clear, we're not rehashing the architecture plan that is locked. What I'm looking for are things around the edges, like additional information, some clarity. Who is the right person to speak to? Here's an expectation around effort. We thought this was a simple bit of effort because the goal here is just not interfering with existing Shopify orders.
So it's the same functionality. As soon as we had the architecture, the environment infrastructure stuff set up, this cloning should be a simple process. So I viewed it as a small amount of effort, low complexity. Is there disagreement?

**lance.fallon@llsa.com | 10:48**
There will be changes to the API so it's not just spinning a new one up. You will have to modify some of the logic inside of it.

**Jennifer | 11:01**
What are the modifications that are needed?

**lance.fallon@llsa.com | 11:04**
I have no idea right now. I just... I took a brief look at it a couple of weeks ago and I know that just off the top of my head... Some of the things like billing, how we map products...

**Jennifer | 11:20**
This is... Did you look at ECOM 2 or the other one?

**lance.fallon@llsa.com | 11:27**
Come to... As an example, where we aren't differentiating parent billing versus child is one thing I saw. I know we add...

**Jennifer | 11:40**
I thought that we aren't doing that yet. We're just entering in the billing or like just the participant info, right? Or like right now into see start.

**lance.fallon@llsa.com | 11:59**
No, I mean we have fields for both.

**Wesley Donaldson | 12:05**
What? Can be...

**Jennifer | 12:09**
But we wanted to simplify it into Star so we can save both of the information. We have the information in Recury. All we're trying to do in CSTAR is make it where we can get them. The order is available when they show up to their appointment.

**lance.fallon@llsa.com | 12:32**
I'll have to give it a care of me then, because we may have to intentionally map the object wrong out of the current event to get it to work in the current e-com API because we intermix the participant and the billing in the current e-com API since they don't differ.
So that I guess in a sense it's a code bug, but because it's the same anyway, it still works, but we'll have to be careful to...

**Jennifer | 13:06**
So now that CSTAR is not... Yes. So CSTAR is not going to be doing any of the billing because Recury is taking care of that. So all we're doing is putting in the participant. So it would just be the dependent information.

**lance.fallon@llsa.com | 13:24**
There is when we create the participant in the e-com API, I think we pull it off to fulfilling information, and then somewhere later down, we do create some stuff up and the participant information.

**Wesley Donaldson | 13:35**
S.

**lance.fallon@llsa.com | 13:37**
So it's I think it's the same coming out of Shopify today, which is why it's all fine.
But we'll have to explicitly... We're going to want to call that out whenever we do the mapping that we're doing it incorrectly. So that it works inside of the e-com API.

**Wesley Donaldson | 13:59**
Okay. So. Just call that out.

**lance.fallon@llsa.com | 14:01**
Okay, I don't know. And I'm gonna have to look at the product mappings.
See, we have to keep that.

**Jennifer | 14:13**
Yeah, and as far as the product mappings, again, we're just trying to map... We just need to map whatever recurring is just to get it into Krisp. So if we have to map things by changing... I don't know exactly how to explain it, but basically whatever it takes to get it into Krisp so that it shows up at their appointment.

**jeremy.campeau@llsa.com | 14:45**
I realized now that I'm thinking about it. So if something fails going into Krisp, we have a spreadsheet somewhere that the call center uses. We need a new one of those. I'm assuming we want it separate from any shop.
If I order... I'm thinking if someone orders a subscription but they already have one in Krisp or if it's not... Depending on the status. The Shopify API thing, whatever you want to call it. Krisp has errors.
So then the call center has to call that person and then resolve it. So we need that same thing for recurring whenever an order fails going into Krisp like that spreadsheet thing is it one of those?

**Jennifer | 15:35**
So the same errors would go into the spreadsheet. We would just need a separate new page or a new file.

**jeremy.campeau@llsa.com | 15:44**
Yeah, exactly.

**Jennifer | 15:44**
Early.

**Wesley Donaldson | 15:54**
Okay, I'll need some more detail around that, but let's keep going. Jeremy, are you on board with...? You would be a good person to take on this mapping activity.
I think with the caveats that we just talked about, like the minimum mapping, maybe even accepting incorrect mapping for the sake of just meeting the core need, are you comfortable taking that task on? SS like a yes.

**jeremy.campeau@llsa.com | 16:21**
Yes.

**Wesley Donaldson | 16:22**
Okay. Do you think that's something that is... What are your perspectives on the level of effort? Is that something that is a target delivery date for that Wednesday? Or some clarity on what the mapping is? How much time do you need in days?

**jeremy.campeau@llsa.com | 16:44**
Definitely, I would not have... I don't think I'd have something by Wednesday. One of the things that will... So the way Shopba has its payload set up, it has a massive payload, but a lot of the information we don't use.
So for now, we can just map a bunch of junk to the stuff we don't care about. But it'll still be a pain tracking down. This is actually used. This part isn't used. So I see that being a time-consuming thing.
I mean, we could just go the route of not making a shit and matching it and then just having a new object that goes into the flow. So that way we only have stuff from recurring. We don't have any junk in the payload.
But I foresee that being time-consuming. Just seeing there's customer information versus billing information versus some random information. Just because it's a part of the payload, even in curly side, doesn't mean we'd use it mapping it.

**Wesley Donaldson | 17:43**
Totally understand.

**jeremy.campeau@llsa.com | 17:44**
Yeah.

**Wesley Donaldson | 17:44**
So there are two tickets on this. There's the actual Lambda work for... Now that we know the mapping actually instruments like actually pushing the right events, populating the right events, and currently...
So there's that ticket and then there's the actual just understanding what the schema is for data coming over as part of the hydrated recurrently order. Understanding what Shopify expects. That's what this ticket is. See, your ticket is like this is a couple of days and this is probably...
So if I were to put these together, I guess targeting the end of day Friday for completion is that reasonable? And again, not forcing here. Generally asking. Not leading the horse. Not that you're a horse.

**jeremy.campeau@llsa.com | 18:27**
Thank you. I don't. It's just tough because it's so big, and I haven't looked at the code in a while.

**lance.fallon@llsa.com | 18:44**
I thought the mapping was one of the more difficult things we did as part of this. I would agree that... A couple of days. It's probably not credibly feasible.

**Wesley Donaldson | 19:01**
Yeah, I think I'd love for us to maybe have this be the first pass, be like, "Here's the API, here's what the perspective map is like." Have that be a Claude task, and you guys are going to bring the knowledge of... No, that's needed. Here's why it's needed.
But I'm hoping that we can just do a little bit of code investigation that says these fields are just straight up, not used at all. That could be a good initial 20% or 40% of the mapping investigation.
Okay, let's keep going. So just ponder that a bit. Let's look at what we have next. The observability is important here. We definitely want a few things, I think, alarms for around... LQ alarms around other critical events that we had. We want in the system.
We need to make sure we're doing a good job of keeping those top of mind, including implementation within Century. So I have a general ticket here. JFFCO for us to really be able to track all... We have the Lambda function already for Century. Is that covering off everything we need?
So you, all of us, please speak to this as well. If there are specific things in alerts that... Tony, that you've identified. Sam has a couple of things on the board that we need to make sure we cover off. It seems obvious that we should have a notification here, but beyond that, are there other areas where those notifications need to be happening based on what we've already done inside of the Mono repo, our current design patterns?
So that's taking when you're implementing something, you should be making sure that your work is instrumented. That's the general direction that we have. But I do want to have someone checking and validating that minimum senties properly see information as alerts were actually created for the DLQS that we have.
So that's what this ticket is. But the expectation is, as you're working, if you need an alert, you should be creating it. So, Jico, I'm leaving this with you. But as we touched on, I know you and us have taken on some of the LLaMA work and some of the Gemini work.
Let's peer-to-peer, pair with him, to figure out how we are representing recurring information. Is it already captured by virtue of the Gemini Lambda function that we have in place? So going back to one to 1.1, I don't think there are any unknowns at this point. On this one, I've actually closed out the spike around the order projection schema.
The rationale behind that one is that it is effectively additional effort outside of just the core ask of getting the orders into and to the C-star. I'm representing that here. So the first gate for this is we need to have that conversation with BI of what they need. Once we have that, then we can have a conversation of what Aurora-specific or what graph-specific change that we need to make to support the need.
But generally speaking, Sam's direction was whenever we're making or modifying a projection, we should be leveraging the new scheme or emitter-based approach that Antonio is going to present to the team or sent to architect during architecture tomorrow.
So that's the high-level direction there. Tony's in here. Correct me if you disagree, but our read of this is that there is no direct urgent need for us at this moment unless we have a touch point that we need to update.
But we don't need to service all of these three tickets to get us into orders into C-star, and on your thoughts...
You're on mute, looks like you're speaking.

**Antônio Falcão Jr | 22:51**
I'm sorry guys, the microphone was muted. Yeah, I was saying that you're correct. We need that those three components to be able to see our coming into car. Yeah.

**Wesley Donaldson | 23:03**
Okay, alright, so good conversation generally. If there are additional things that you see similar to the customer service Excel sheet that are needed, please help me with... I don't have visibility to that now, so let's get that documented.
Then generally, I'm hearing we... This is a decent amount of work, and this is the best-case scenario, maybe the best-case end of this week, but more realistically, probably pushing into next week to get the Lambda and get the mapping all worked out. I'm not hearing any pushback or concerns on this side of the house.
Does anyone disagree with that? Is there anything that is unknown or not represented currently?
Okay, let me rephrase the question. These are already assigned out. Antonio, you have the hydration and the LLaMA. You are clear. You need there... No pushbacks, no concerns, no blockers when you actually pull this into your queue.

**Antônio Falcão Jr | 24:13**
Yeah, no concerns, no blockers. I may need some specific details regarding to recurly, maybe some access credentials, this kind of thing, but I will be the aiming guys that have been working with RECORDUROMERS recently.
Nothing specific that I can mention now.

**Wesley Donaldson | 24:32**
Okay, so both Elvis, Lance, and Jeremy have been working with Rick Curly. So they all have... I think I added it to the main ticket, the integration document. I'm not sure if everything you need is in here, but probably start with this, and it'll probably link off to additional things you may need.

**Antônio Falcão Jr | 24:48**
Yeah, I'll figured that out. Noory.

**Yoelvis | 24:50**
Yet.

**Wesley Donaldson | 24:51**
Cool.
Okay, so nothing is on... For you, there was one minor change to your CDK ticket. Antonio should be a reviewer. You should obviously probably get a review from Lance and/or Jeremy as well, but nothing major here. To do the Lambda for actually getting the webhook, we have clarity on the integration of how the core here is just pushing that event into SQS for us to consume down the line.
So that's the critical thing on that function. This is a new ticket, Lance. I actually gave it to you because I think it's... I want us to be once we have integration, I think we just need to actually do a proper test to demonstrate each step gets data, but more importantly, each step handles failure.
So the goal of this ticket is great. There should be a check to confirm the D LQ is working by pushing something that doesn't get processed right. Make sure the event is inside of SQS and make sure the event of alerts relative to the failed handling is inside of SQS. This is just like a... Make sure all of the observability stuff is working the way we expect it to.
Okay, so I guess an open question, Lance, is that you have a couple of things there. You have a perspective of... Do we think this is like end of next week, end of this week all in or...? My question is... I'm asking you to challenge a perception that we'll be able to launch just in production by the end of this month.
So realistically, we cannot be the end of the month. It has to be probably the start or absolutely it is the middle of the week. We cannot... We're not actually going to launch us on April 1st. So my question to the team is... Anything... Do we perceive that target date is reasonable? Can we get to that date?
Don't be shy, guys. This is our chance to... Manage expectations around the work and to get the information or the support that we need.

**Yoelvis | 27:11**
I have a question. I ask... Difficult? Are we creating the whole stack in AWS blue-green deployment and everything else? Only for one API that is gonna call a landa to resend a bend to kor. It's not that like kind of overkill.

**Jivko Ivanov | 27:39**
I think Wesley is asking a different question. But, again, just to respond to what my understanding is that this particular stack needs to be completely isolated from the other work. So even whatever we are developing here or breaking something that should not affect the other stack, that's the reasoning behind, at least my reasoning, behind a separate stack.

**Yoelvis | 28:05**
I don't see that... Why creating one very small API is going to affect the other areas that are not even in production because... Is still in testing.

**Wesley Donaldson | 28:21**
Yeah, I think that's a conversation you, Antonio need to have. And co you can certainly be a part of that.
But I think the direction is from continue with the patterns that we've already established in the Montana repo, but just from like from Sam's direction around like this should be a LLaMA that should be like we should use an API gateway as the entry point. Those some of those decisions are coming directly out of Architect.

**Yoelvis | 28:45**
No, that's completely fine. I'm just asking because we are creating a whole new CDK stack and infrastructure and everything just for one.

**Wesley Donaldson | 28:46**
Okay.

**Yoelvis | 28:55**
API that is... It is just resending an event from... Into current.

**Wesley Donaldson | 28:57**
I see you.

**Yoelvis | 29:01**
So I feel like we could put that API in one of the existing stacks and it's not going to create that overhead. But, yeah, it's just an observation, nothing else.

**Wesley Donaldson | 29:17**
Well, let's not miss that observation. I want to... That's part of the review process. So I would say you heard... Like Antonio Jico.
Please, let's compare and respond back to his fair mask.

**Antônio Falcão Jr | 29:29**
Yeah, sure. Let me review it as well. I'll give my opinion on it.

**jeremy.campeau@llsa.com | 29:35**
Yeah.

**Wesley Donaldson | 29:36**
All right, I think I'm still... Maybe I'll ask you guys to just DM me directly. I feel like a public forum is not the best place to have the conversation. I want us to have a frank... I want you to feel comfortable giving me frank information relative to our ability to deliver relative to the dates that we've given.
I think I'm not hearing a yes. I'm not hearing a no, either. Okay, so I'll give folks back some time, and I'll ask you to please reach out to me directly and let's address your actual concerns.
There's nothing wrong with being concerned. You don't have to say yes because that's the direction that leadership has provided. We need to find a way to support leadership's direction. If it's additional to you, it's a different way of working. Is there a different way of approaching something? I need to have that insight.
So I can start those conversations. Okay, guys. Any last-minute questions or concerns?
Okay. Thank you, guys. For the time.

**jeremy.campeau@llsa.com | 30:49**
Thanks. Have a good one.

