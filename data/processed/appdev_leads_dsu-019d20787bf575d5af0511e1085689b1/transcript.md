# AppDev Leads DSU - Mar, 24

# Transcript
**Jennifer | 00:20**
Three.

**Wesley Donaldson | 00:21**
Good morning.

**Jennifer | 00:36**
Morning.
We can probably get started while we wait for Harry to hop on.

**Wesley Donaldson | 02:01**
This...

**Jennifer | 02:07**
Wes, did you want to kick us off?

**Wesley Donaldson | 02:12**
Absolutely, good morning, all. Let's jump in. So from right to left, I'm going to focus more on what's ready to go to production. I want to take you guys through just the current state of the integration document. We had good progress made yesterday around the architecture and around the environment. We had Jeffco put in review his task for closing out the blue-green for the production instance that Francis completed a few tasks as well related to just setting up security and setting up the individual DNSs that are necessary.
So good traction around being able to just get the API gateway into the web host into everything we need apologies into everything we need from the order ingestion flow. We had good work done around just some additional tickets that we had that are not specific to the orchestration and not specific to the order ingestion coupon entry specifically. Co opened a PR for that where Jico is out today. On... Today not sure exactly when he'll be back today, but generally we have that ticket completed. We refined and pushed the additional tickets related to membership discounts into the flow. You all of us are going to tackle that.
So good. Generally around the idea of how we're supporting membership and just manual discounts as well. So that's the roughly around the environment as well as a core feature related to checkout related to discounting. Your... Has a couple of things in process around just the improvements in the improvements in just bug fixing in the order process and in the larger... I guess infrastructure. One of them is around Blacksmith. This has been in review for a little while, but I think the goal is to get this in as part of this deploy.
So just go to look push in a little bit and just getting this closed out as it does have impacts on just how our build processes work. He's working on one additional ticket for the build related to the place order, so since he has that expertise on placing orders in... Curly, I've given that refined ticket. Apologies. Let me just make this a little easier for myself.
I've given that refined ticket around place order to you guys. We confirm that today. So he's going to tackle how to actually get that order and discount information into the... The end. There's a conversation he wants to have, which we'll have on the product app... But generally, he's going to be tasked with bringing that completed order through. One thing that we had a bit outstanding on was something that... Is tackling specifically. He has a few items in review that are related to our SE track, so I'm just touching on those real quick.
I've spoken to the team about just needing to get these off the plate. He has a couple of priorities around the blue-green environment. Just verifying the work that Jeffco has done, but I've asked him to time box. Just getting to a final clarity on some of the smaller tasks that he has in his queue. One example of that is these two tickets here that are related to an incident that we had three weeks back. At this point, these are lower priority. We believe these are all actually done, but we just need someone to verify those. We believe these were solved for as part of addressing the dead letter queue as well as the code sweep that we did, so that once those are closed out, he'll be able to assist with two core tasks, that being the production confirmation for blue-green and closing out the help chat icon.
Then he has the tracking. So these are... He has a message in to get some support from the team on this one. But these are pretty straightforward, and these should be done pretty quickly as well.
I think it's best for us to take a quick view of the state by looking at the diagram. Our priority today is really just getting a lot of these turned green. Most of the work here... I said this was the outstanding work. The security concern as well as confirming the blue-green.
So those are done. That's the PR, the in reviews that you saw. So the team will gather again, and we'll be able to, as a team, turn these screens if those reviews are indeed completed. That will effectively have everything up to this larger effort turned green.
We had a good conversation yesterday around what the work that Lance is tackling is. We identified a bit of a gap around just hardening of the environment. We were missing a bit of ADQ, we're missing AD LQ notification.
If invent information was pushed from the current system into the event, great. If there's a gap there, so we identified that gap. We had ticketing around that gap, and the team confirmed the line and how we're going to solve for it.
So that issue identified. Thanks to Sam for that. Issue identified tickets created, teams aligned. We're still tracking for being able to complete by the end of this week even with this new edition BI. We had good progress made. The BI team did share their final KPIs with us.
So we did have those keys and key data fields, we've ticked them around them. We're going to tackle that as a secondary priority after Antony gets through the updates he's making within the Emmet, the larger... How are we putting in and pulling information from the current into our back-end systems?
So once we complete that work, we'll tackle the BI work. We may actually ultimately end up having me tackle this. But for now, it's still planned for Antony once he's able to complete the more critical core work of the...
So far, that is not a blocker. We're still projecting to have that BI work completed for next week. Questions or concerns?

**Sam Hatoum | 08:21**
Quick addition, just a quick edition. I'm happy to stay behind if we have some time within this call just to discuss some not major, not minor but medium changes to the design. I did a whole bunch of simplification yesterday with the team, so happy to discuss it. Or we can just wait until our architecture session.

**Stace | 08:43**
No, I'm curious to know. So it looks like we're on track just because you said go green. Hopefully today. So we think we could have at least the webhooks and the data flow in production tomorrow.

**Wesley Donaldson | 08:54**
Yes, and just to confirm for you, Stacey, remember that you stay in status.

**Stace | 09:02**
Okay, great.

**Wesley Donaldson | 09:09**
I mentioned the Antonio end-to-end test that proves order creation all the way up to pushing information into production.
So that does prove the functionality. The thing that's missing why these are not green is just the blue-green environment specifically.

**Sam Hatoum | 09:22**
Yeah, okay. Once we get through the stand-up, the rest of this DSU. I'll just roughly do a quick run-through of what simplification has yielded.

**Harry | 09:34**
Well, I'll go...

**Sam Hatoum | 09:35**
Super fast.

**Jennifer | 09:41**
I'm sorry.

**Harry | 09:42**
Okay, so the membership status that the DJ was working on, which was that endpoint, is ready to go. He was concerned about some missing web configs, but we're not going to know that until the recurring stuff is done.
So I said, we're going to complete these. We have a separate ticket to validate everything once the other side of that's done. So he's moved back over to goosby stuff, which we need to get out, according to Ray, very soon. Now this live issue, this Natasha Brown person, according to... It looks like it's fine.
So he's still looking in, but he's checking with someone from... I'm not sure specifically to verify that it's actually okay. The interval of events having incorrect metadata. So that was around the first name. There was one specific path. Dane has it and it's simply because based on a cognitive event doesn't have access to the first name.
So he's got one solution. We were chatting about it. We're probably going to chat more about how we want to get that first name without putting it everywhere, especially when it's something that can change and we're specifically not putting it in Cognito. The alerts firms just picked this up, so he's adding this now. It should happen today. The testing for admin portal is all covered by these stories. One's ready for product actually is this is done. The other two are ready for review is like copilot review stuff popping up on the done yesterday we have the one live issue on it my just the one off. A debug log around, loading Cognito. It was just like the actual log was duplicated. They were saying the same thing even though they were in different places.
So it's just a clarity thing so that we when we look in CLOUDWATCH, we can see it updated the screening object and polling service. We thought we actually had that. It turned out Friday we did not. So I've updated that.
Then now I'm working on getting those fields in Thrive and into Aurora DB so PR will be in coming this afternoon. Just doing the inside regression for checking streams with the old version of the event and the new version. We don't break anything. The other one, it's on the other one on the status side is the those individual product statuses where you have partial failures for whatever reason. This is another situation where we have to augment the data that polling service is pulling out of CSTAR, so it's got an approach for that. We're going to discuss that some more, but that will unlock quite a few things once we've got the individual product status. That said, we bumped into the issue of individual diagnostics and their products.
So really what we care about is the diagnostic, but we're using the product. So I mean, we still have to work around that and that's everything. This one is blocked. We don't have an answer race that he's going to...
It's got to call today to find out the answer. That and the gateway portal is still waiting. We have no news on this, and that's everything for Rinor. I have to take my dog to the vet, so I'm going to switch to my phone.

**Jennifer | 12:59**
Okay? So. Okay.

**Stace | 13:01**
Something I've been thinking about. I'm just going to throw it out there. Now if we're going to open up the C Star events going to the S3 bucket, we already do something in the proxy for Shopify right where we're... We understand that the order was placed outside of CSTAR when we inserted into CSTAR. I believe I have to look at that too.

**Jennifer | 13:31**
Yes, I do.

**Stace | 13:33**
That needs to make when we have new orders come back to the S3 bucket. If that's not already there, right? We have to understand the orders coming from recurring as they're processed by the current results system where we will need to understand...
So we know... Because as we're inserting orders to Thrive, eventually we're going to have to make sense. At the moment, we're going to have two separate participant streams, one which will be our future source of truth, right? The participants created by them placing an order and maintained by updates to that participant profile, right? Then a few minutes later, we're going to get a reflection from CSTAR, right? We'll insert that order. C Star is going to send that back to Thrive to do all the event or all the resulting stuff. We need to understand that.
So we don't double create participants in the future that were already created and we recurrently directly to Thrive. Does that make sense?

**Harry | 14:38**
Yeah, it does. So basically, you don't want it if it's coming directly from a curly and then the one that comes round trip via CSTAR, we don't want a collision there causing duplicates. It seems like something that's fairly straightforward as long as we know.

**Stace | 14:53**
It should be, right, because we'll have to listen to it for a while, because it still needs to... That's the only way we're going to understand. That's why we make the PGIT account and do a bunch of stuff at the moment.
Yeah, but eventually, as we strangle that out, we're going to need to understand the difference between the two.

**Harry | 15:09**
Yeah, I think. I mean, maybe Sam's got an approach there, but it kind of just makes sense to use different streams. But I think that's how we're starting.

**Stace | 15:19**
Right? They'll be kind of the recurring stream and the. But I think to merge those over time.

**Harry | 15:27**
So yes, I think the only place I can see where you might still have an issue is if we are bringing the two in their own separate streams. So within the event store, it's very clear. But if we're putting them into the DB, that might be a point where they get conflated.
And when you read them back out in the projection, you could have an issue.

**Sam Hatoum | 15:47**
And that's exactly the place to fix it. In terms of recording, we record everything. It doesn't matter what happens. If it happened, record it, simple as that. Shopify order, duplicate, not duplicate, they're the same. It doesn't matter which record. All of them.
That's step one right now. We have the facts with the facts, we then make sense of them, and that's where the projections are. So, there's no harm at all in having the events as long as we have the discriminators inside them to let us know.
This one came from Shopify, this one was from Ricardy, so this one takes precedence. And then those rules that basically will get executed in the remodels. So all the work is going to be in the remodel projections.

**Harry | 16:25**
And but right like if the re model projections coming out of the SQL, it's the writing to the SQL as well, right?

**Sam Hatoum | 16:34**
Yeah, same thing exactly. Like. Okay, you know, think of. The SQL is just the final cache, right? But like what is like we project the data in the shape we want, whether we cash flow or not. That's a separate concern.

**Stace | 16:46**
Got it. Yeah, just throwing it out there as we do it right. We've still got a minute because until we can get call center on of CSTAR right, we're still going to have more orders from CSTAR we're going to have from recurring.
But as soon as that's done, then we'll... That's close to being done. Then we'll want to sort out how this is all going to work so that orders coming from recurring can trigger all the resulting stuff directly.
We can just stop largely stop listening to that S3 bucket sense. But should quiet... I'm hoping right that'll be a really good day because that should quiet a lot of our day-to-day and production bugs just because seasons.

**Sam Hatoum | 17:41**
We're going to bring some celebration beers or tea or whatever your journeys. Alright, cool. Do you want to go through the simplify? Yeah, let's do that. A pretty major, but in a good way, less code is good code.
All right, so we spoke about this. There's just a real quick here there's a DLQ that is about the web hooks coming into SQS. I'm going to come back to this, but I just want to say this should be dedicated to recurring.
So you notice here you got recurring. This is an SQS with a DLQ dedicated to this stuff coming in here. So if something goes wrong, we can always come back here, look at the dead letter queue for that, get notifications, and know that this one is dedicated to recurring data coming into our system.
That's the buffer. So now what was before going on was we had two separate connectors from Krisp that were destined to become the Krisp membership renewal for this MMA and then the sync connector.
Then we're going straight to event grid. My worry was that we would have a failure right here, right? If it's going to event grid, if there's a failure, then it would have fallen back onto nothing.
Well, it was... The idea was that we're going to send it from here back into Krisp as a parked event. Previously, in a conversation you and I had, we said we want to move away from things like parked events and move on to things like that letter queue, which everybody understands naturally, right? There's just a lot more knowledge and easier uses.
So yeah, we inserted this letter queue right here. Sorry. This queue over here. So that way when our system says, "I've sent this and I've had a handshake with Krisp," it is out of my bounds. Now I've done my...
Now it's in the job of this event bridge job processor. So this event bridge job processor is a simple lambda. It basically takes it in from a queue and then it gives it to an event grid. If it doesn't work, then it puts it in a dead letter.

**Stace | 19:38**
Yeah, that's the way to do it. That's how I thought it always was going to be done because that's what Event Grid gives us for free. You actually have the same thing in Azure, right?
Because event grid... It is a copy of Event Bridge when you tell it to receive the event. Not that you want it, but you could, right? You could if you had... Processed for some reason and it could queue up the same way there.

**Sam Hatoum | 20:04**
Right. So this is a pattern, it's a stack that we can just have a repeatable stack everywhere. Whenever we have an external dependency, either incoming or maybe incoming but mostly outgoing, we can basically just replicate this.
Yeah. Then we're like, "Okay, well..."

**Stace | 20:16**
All of the make because then if there's a deployment or something on the Azure side and it's not available for a minute, you're fine, same thing, right? We deploy and we have a maintenance window... Recurring... Can't get us... We'll get the retries when we're back.

**Sam Hatoum | 20:29**
Precisely. So then my worry was that we had with the CTAR, we had a failure point going out to SQS, therefore we needed to handle it. Then going back to current over here... Well, that's a call from the Slack, which has to meet the possibility of failure because that's just a connection.
If we don't get to park the event, then what happens? This is kind of key. We cannot lose all the placed events, right? That's just not okay. So then the simplification here, and actually it's a really large one, is rather than have Emmett, which was operating just in a single box over here, we actually expanded the scope of Emmett to be the single core logic package.
So it's not so much about Emmett or not Emmett's just a framework. But basically the idea is that we now have a single core logic package where if an event comes in from SQS, it comes here and our core logic fails, it comes back onto the dead letter queue so we know we have a failure in our core logic. Therefore, we're still getting the events, but we need to fix it within this box.

**Wesley Donaldson | 21:29**
4.

**Sam Hatoum | 21:31**
Now that simplifies significantly our connectors approach.
So these guys no longer have to use connectors because Emmett has reactors built in. So this is just basically when an event comes in called "order placed." This is now based on the reactor rather than EME connectors.
The nice thing about that is it all runs in a single process. So cognitive load developers working on this, they know that everything is happening in a single core logic box. When and then the projections, the reactors, etc., they will happen with it.
So that was the other certification. It really just means that way, any failure in here, we can decide whether we want to log loudly, we're going to send an alert or whether we're going to...
We haven't... If we haven't recorded the event, then it fails here. If we've recorded an event and something needs to continue, this basically raises alerts saying, "I've done, I've received the event, but I've been able to do something in here."
At least it just keeps it in one process where it's much easier to reason about. So major simplification and removes a ton of craft because if it's all one process, you need fewer exchanges between distributed systems. You need fewer lands, you need fewer things.
So a lot of the connectors, freight, and lambdas needed with that, and everything's just wet away. It's a single Lambda which then opens up the possibility for us to say, "Well, in that case, if we've now got this benefit and we can rely on Emmett's reactors because they're so robust, then we're doing our read models soon this way."
But all the connectors that we've got from before for read models, we can actually just factor them into here as well. We're not going to do that right now because it's already green and working, but that's an easy change.
That way we have even less infrastructure. Less infrastructure and less code is less bugs. So that's it. Antonio is doing this, but it's a very simple change, by the way. The simplification is actually a small amount because we're ripping things out as opposed to building a bunch of stuff.
We already have M and running as a single Lambda. So it's just expanding the scope of what used to be just this box is now this bigger box. Then that means that... Sorry, it's just going to take into one day. He thinks it'll be done by the end of the day today.
So we'll still be on target.

**Stace | 23:49**
Couple of questions, just one for... I think it's probably just clarification. So in the under the projections we have the one that's... Are those different domains? Are those both remodel BI landers? There is one remodel for graph LLaMA and the other one I read model for BI LLaMA.
Yeah, there we go. Okay, that makes sense. Okay, no, I like it. In this Emmett pattern, the box that hydrates a CL lambda that is one piece of code deployed to a single Lambda function.

**Wesley Donaldson | 24:47**
Sam, if you're speaking, you're on mute.

**Sam Hatoum | 24:51**
Thank you so much. Sorry, I was talking so much behind the scenes. I was saying that, sorry, this is the odd ball. Actually, this is technically not in the right place. Let me just move it real quick and I'll tie you up later. This is outside that box right now. This is using Connected. Everything in here is using Connected.
So this whole thing is one lambda. The pro package is called logic. This is one lambda, no.

**Stace | 25:14**
Okay, over time, do we want that to be one lambda for the universe, or do we have multiple core logic packages by business domain?

**Sam Hatoum | 25:29**
Possibly, I don't know. I mean, it's easy that the deployment boundary is easy, but honestly, I think the more we can get away with having it in a single place like this, the better it's going to be for cognitive load.
Because everybody can look at this. It's much easier to reason about a system that is in one place than it is to reason about... Now I have to go check the other land or where it went to... Where did that go through? Now you have to have error correction, a certain error correction, distributed logic, compensation, for failed cases.
That's where it came from. So I think this will grow significantly because it has room to grow significantly because within the core logic package, you just imagine this for a second here. We've missed this SLA, and this might be core, and this might be SLA FSA, and this might be slash all the different domains can easily live. No problem.

**Stace | 26:27**
Okay, yeah, even for the sage, I think we do have to think about it. So I'm not disagreeing. I don't want to create a problem that doesn't exist yet, but it's easy to understand and the convenience of everything in one place becomes bigger. Blast radius for errors.

**Sam Hatoum | 26:47**
Yeah, for sure. I mean, I totally get that. And that's why I think like, you know, we can build that. And so we've got Dall Q's on this side, we've got the L Q's on the outside. And now within here, you know, there's the concept of like, you know, durable workflows, which is something that we can do with EMET as well.
And now like once we get into durable workflows, which is he talks about here, now we're talking about something that even with failures, it could actually pick it back up again. So you know, we can just start building nicer and nicer patterns within this box now.
But as much as I love connectors and like the thing we did before, this offers us a massive level of simplification. Because I was sitting there yesterday with Lance, pairing with him to see, like, hey, how can you. How can we make this go faster?
And how can we make that easier and more robust and stuff? And how do we make sure that this key part here, which looks like it's a tiny part, but like it's kind of the Achilles heel of everything we're doing right now, isn't it?
Like order. Place must come here otherwise we're in deep trouble. Is that a correct assessment, right? Yeah. So anyway, that's where it came from and in the process of doing... I like "How can we make it simpler?"
That's where this thinking came from. So this should be actually projectors. Yeah, that's it. Happy to answer more questions than I... Where at time... I can go through this more with... In architecture if you like. Last thing...
Sorry, last thing is that we unified both of these calls that we're going to event Krisp since it's the same thing, all of them are just jobs with a type, if you like. In here, the job goes on to the processor, which then sends it to an event CD.
Then Jeremy was on the record and he's just going to discriminate based on the type coming in over here to know where that event goes to on this side. So yeah, even less work at that point. So Lance is looking at both of these now.
All right, so hopefully all green these both these boxes hopefully by end of week all green and then we should be in a... That's it. That's the crack. It's back right in production from left to right.
Where did you have your hand up? Stuff? From two hours ago because I couldn't see.

**Wesley Donaldson | 29:04**
I don't know. Actually, I wanted to raise a topic for proposing a topic for architecture this afternoon. We had a good job of doing a pre-mortem. I think we had left out the... We had agreed that we wanted to touch base again on just doing some scenario planning and just figuring out how we wanted to attack some of the possibilities that might happen.
I think that would be a good topic for us in architecture today. If anyone has any objections or thoughts on that.

**Stace | 29:35**
Yeah, I think that's fine, Sam. Probably a quick review for everyone if they're not already aligned with what you just showed us. It all looks great. So, ideally... In our timeline...
It sounds like we're really close. If you're going to deploy most of the webhook stuff tomorrow, we could start regression testing from the Reculy side and verify we have the data at least into Thrive by the end of the week, right?
I think so. I wanted to still be doing UT this week. If we're still working out bugs on CSTAR on Monday, I think that's okay. But I'd love to have all the Thrive stuff buttoned up by the end of the week.

**Wesley Donaldson | 30:32**
That is the goal of...

**Sam Hatoum | 30:33**
Yeah, I mean, it's. It's those. It's those three boxes, right? Like recurly, ingestion or logic. And then the queue over to Azure, that's it. Like those are the three major pieces that we just need to see and in what the effort is good.

**Stace | 30:47**
Okay, no, that's good, because Reculy has an exercise. Once we set up some test data for them, they run a bunch of stuff on their system, check out their logs, look at their web connections, styles, and things like that. That gives them time to do that all within the window we want to be operating in.

**Sam Hatoum | 31:12**
Alright, see you at the architecture session. I... Wesley, can you please resend that to me? It's not on my calendar, so please send it over. Thank you all, I'll chat with you later.

**Wesley Donaldson | 31:19**
Jennifer, I think you own that one. Check the calendar.

**Jennifer | 31:27**
I was having issues with it going away for one week. Is it back next week? Okay, I kept trying to add it to this week, and for some reason the same meeting wasn't... But, if you guys are all free at 1 PM, I can...

**Sam Hatoum | 31:44**
Yeah, that's what it is. Okay, all right, cool. Yeah, if I've freed off myself right now, I'll put a placeholder in there, but yeah, I'll just use the same... I see.

**Stace | 31:51**
Yeah.

**Sam Hatoum | 31:51**
On next week onwards, it's on your... Just this week is missing.

**Jennifer | 31:55**
Yeah. Sorry about that.

**Sam Hatoum | 31:58**
Soviet.

**Jennifer | 31:59**
Okay, I will I that there. Thanks.

