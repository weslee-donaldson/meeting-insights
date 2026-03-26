# LLSA, Antonio 1:1 - Mar, 24

# Transcript
**Wesley Donaldson | 00:23**
Hey, sorry, I find the need to... There's a lot of stuff moving around, moving very quickly, so I just wanted to make sure I connected with you guys and made sure I'm reflecting your work correctly on the board.
That's right.

**Antônio Falcão Jr | 00:38**
Sure.

**Wesley Donaldson | 00:38**
I manage a board for a living. So let's start here. The biggest concern I see between the two of you at Lance... Thank you so much for joining that. I see between the two of you is the separation at this level.
So my understanding and what I have in the end right now is Antonio the reactor is on you to build.

**Antônio Falcão Jr | 00:53**
Right.

**Wesley Donaldson | 01:01**
My worry with that is that what's inside of the reactor is a task that's necessary, at least at this level, for the membership renewal. It's a task that's necessary to hydrate objects specific for the renewal that's going to be handled by CSTAR downstream.
So I'm not sure if you have all the details specifically for that. So maybe you're just creating the harness and Lance is following and actually creating the actual source code necessary. Where does that show up? Just quickly get to that for us to do that. It shows up.
So we have one ticket here for migrating the LLaMA approach, and then this ticket represents the reactors themselves. So that's those are two... This is on you, Antonio, for the reactor. However, the actual work that involves creating the object that CSTAR event grid understands is here.
Right, so that's helpful. So this is the actual object we need to instantiate and push on event grid. So this work here? My thinking is that's more for Lance. However, quite clearly there's a bit of overlap between what the reactors code lives in the reactor versus the actual implementation logic needed.
So maybe just what are your thoughts on that?

**Antônio Falcão Jr | 02:23**
Yeah, can you get back to the diagram, please?

**Wesley Donaldson | 02:26**
Sure.

**Antônio Falcão Jr | 02:27**
I think that it's a bit easier... Pretty much aligned with what you have said.

**Wesley Donaldson | 02:33**
Get out of the way.

**Antônio Falcão Jr | 02:34**
Yeah, two minutes, no problem.

**Wesley Donaldson | 02:37**
There you go.

**Antônio Falcão Jr | 02:38**
Good. Yeah, it's quite aligned with what you have said.
But my understanding is Lance can correct me if I'm wrong, but my understanding is those reactors actually will just push the domain event to the queue. For example, the C-star sync connector we have there, it's not a... Now that we just push the order placed event to the queue, and then the event grid job can consume that resiliently and do the job from that on.
So it's simpler than I... In my opinion, it's simpler than this diagram is showing because I know Sam did this on fly and it may have some details for us to adjust, but my understanding is this one. What about the lens?

**lance.fallon@llsa.com | 03:42**
I didn't know if we'd made a decision there, but... So you're saying the idea would be the reactors basically just take the domain event, drop it onto the queue that we're creating, and then the queue handler would... If it has to reshape the event, it would do it there before it sends it to the event queue.

**Antônio Falcão Jr | 04:04**
Correct the event. GRE Job is the responsible for you know, do whatever he needs to do in order to achieve the C star specific need.

**lance.fallon@llsa.com | 04:17**
Then the expectation would be that everything will be on that domain event that we need to shape it or will we have to make additional calls? Potentially.

**Antônio Falcão Jr | 04:29**
Yeah, this order placed event, it's a quite rich event. You're supposed to have everything you need. We can... You can double-check if I'm mistaken, if I haven't shared the event shape ready, I'll do that right after this meeting.

**lance.fallon@llsa.com | 04:47**
I think the order shaped the order one looks good.

**Antônio Falcão Jr | 04:51**
Yeah, I'm assuming just now.

**lance.fallon@llsa.com | 04:53**
Looking at the subscription stuff, I do have concerns with that one, but the order one I think is that. I mean, this is what Jeremy is basing all of his work off of. So I basically just have to take this and send it over.

**Antônio Falcão Jr | 05:11**
Yeah, but just closing the loop on the diagram. My understanding is that we don't need those two pieces inside of the current integration reactors. Those are not real or individual components; they are just a reactor that pushes every domain event to the SQS and whatever we need to react rather to Krisp or to membership. We can just consume the events because SQS, we work with subscribers.
The processors, the Lambda desk can subscribe for whatever event it wants to. It's a queue, and then do the work. You guys see my point?

**Wesley Donaldson | 06:01**
I'm sorry, I'm just going to distill this down. These don't... The domain here is just events inside of current, so there's no detail consideration here. There's no... What does it look like the star? This just pushes whatever we have based on a filter.
It's a filter. Some filter gets pushed some events on our message queue. Now this job here, it needs to understand that we are only developing for two needs right now, two events. So for those two events, we need processors specifically inside of this layer that services individual...
Because it's going to pull this message off the queue now it's going to say, "Okay, well, what should I do with that?" It's going to have to go and get understand how to get the right event to format it correctly that's going to happen in here and then push that on EVENTBRIDGE.

**Antônio Falcão Jr | 06:47**
Pretty much, it's a bit simpler. This specific event GD job LLaMA will consume the order placed event and just bind the information into the DTO and push the DTO to event bridge. Pretty much.

**Wesley Donaldson | 07:04**
But there's two of them, like so this is this like a factory pattern or something where well, not a factory pattern is this just kind of like has to have two implementations inside of it because these are two separate structures that it needs to create.

**Antônio Falcão Jr | 07:17**
I wasn't under expectation. Okay, we can't discuss that with Sam or not, but it looks like we could split them or make the same because they are two different concerns.

**Wesley Donaldson | 07:27**
Absolutely.

**Antônio Falcão Jr | 07:31**
In my opinion, we could have two separate lenders for that to avoid the membership. We have one specific limit that will consume membership events and handle membership needs, and the other one that we will consume order-placed events and handle C-Star needs.

**lance.fallon@llsa.com | 07:52**
Is there any...? For a second, Lambda for something like this?

**Antônio Falcão Jr | 07:56**
I just like to keep those separated to avoid... If we need to change anything on the order-placed consuming, we do not affect the membership, which is a completely separate need.

**Wesley Donaldson | 07:57**
What?

**Antônio Falcão Jr | 08:11**
So it's more to make it more reliable, but it's not really necessary if we don't want to do that.

**Wesley Donaldson | 08:20**
Okay, right, sorry, I think that...

**lance.fallon@llsa.com | 08:22**
I mean, we could just consume the event, check what type it is, and do the mapping. One Lambda at a sense of the event crew wanted to keep. Yeah, but in pool.

**Wesley Donaldson | 08:35**
Hey.

**Antônio Falcão Jr | 08:35**
Yeah, but membership is not even gried specific, right? Membership it's a different it's a completely different world. We're gonna do a different thing with that if I'm not mistaken, right? Are we do we have do we know already what do we do?

**lance.fallon@llsa.com | 08:52**
Renewal... I mean, we're sending it to the event crew just like an order-placed event. The only difference is it's going to be a different shape.

**Antônio Falcão Jr | 09:01**
I didn't know that. I'm sorry.

**lance.fallon@llsa.com | 09:03**
I was starting to check the event type that's coming in and filter out what it wants.

**Antônio Falcão Jr | 09:09**
Makes all the sense. Yeah. I didn't know that. I was. I was imagining that we were, like, making some, email sending or something like that specifically. So. But, yeah, if both of them will end up going to a vent grid, a hundred percent agree that it's one lambd.

**Wesley Donaldson | 09:26**
Perfect. Okay, so there's one Lambda that's great. So I think the ticket is actually fine.
So it doesn't explicitly say you have to implement any logic inside of that, so it's like push what you need to push. So I'm happy with that. Then if we go back to then, this now makes sense. 790 now makes sense.
Well, do we need a separate one for...?

**Antônio Falcão Jr | 09:51**
The only detail I have to clarify later is the membership. But we must discuss what membership-specific events we are looking for because we have multiple.
But yeah, we can... Because we don't want to... I don't think we need to keep pushing multiple events to the SQS just to accumulate them there. So if we don't intend to consume them...

**Wesley Donaldson | 10:21**
Well, why would we? We're only... We only care about two events. We care about the membership renewal and we care about order placed so that should be the only thing that gets pushed on here. Is that what your concern is? They all seem like wrong.
Those have no value yet because we're not doing anything with them.

**Antônio Falcão Jr | 10:40**
No, that's clear now if we have this path clear what events we have so it's the renewal only. Okay, that makes all the sense to events. Okay, one to order, one to membership. Good.

**Wesley Donaldson | 10:52**
Right? So then I think we're so.

**lance.fallon@llsa.com | 10:55**
Did we want to verify that because they mentioned that the job that we're replacing just holistically updates the status of members in CSTAR?

**Wesley Donaldson | 10:55**
So...

**lance.fallon@llsa.com | 11:06**
We have things like canceled, for instance. We have expired, which we're not listing to, but...

**Wesley Donaldson | 11:17**
Well, I think that's a bigger conversation that we need to have simply because we haven't... No one has spoken to us about anything other than the structure of pushing orders and renewals into CSTAR, and that's the only place where anything gets actioned for recurring right now, right?
Unless you've had a different conversation or another conversation somewhere else.

**lance.fallon@llsa.com | 11:41**
No. I mean, this is the first I'm hearing about these tickets, so I haven't heard...

**Wesley Donaldson | 11:47**
Okay, all right, so then, just to summarize, here we... Antonio, you have two tickets. Just the general pushing of the events onto the message queue. You have the single process for...

**lance.fallon@llsa.com | 11:58**
Right.

**Wesley Donaldson | 12:00**
So you have that you have those two and then Lance, you have two as well. You have the very grid job package and then the individual for the renewal notification. Do you want me to create like right now we basically have a job for creating this structure here or tick it to create this structure it for creating this. I don't have a separate ticket.
I know that you're probably looking to put these into one, but I have one ticket for this because there's a lot of conversation around it. And then I could create a separate ticket which is really just the old ticket renamed to this do you s.

**lance.fallon@llsa.com | 12:41**
I mean, if I'm doing both, maybe one for the package for just the queue, all that set up the stack. Then if we want one for the logic of handling, we could probably combine the renewal and the order placed into a single ticket.

**Wesley Donaldson | 13:07**
Okay, we have this. It should already be done. This was the old one for actually doing the process.

**lance.fallon@llsa.com | 13:18**
Yeah.

**Wesley Donaldson | 13:19**
So I'll rename this from "deprecated" then so it's still active, and I'll update it. This is still in process and this is now command Jesus...
And this is now... I don't want to call it... Emmett... Yeah, whatever. Emmett order delivery.

**lance.fallon@llsa.com | 13:57**
Is this the reactor handler? The QE handler, right?

**Wesley Donaldson | 14:00**
What did we call it? Did you give it a specific name?

**lance.fallon@llsa.com | 14:06**
Yeah, you're comprised.

**Antônio Falcão Jr | 14:09**
It's the Q1. Yeah, the reactor is on the ACL side, it's a subscriber or consumer. I think subscriber is more... Specific.

**Wesley Donaldson | 14:24**
I'm just gonna. It's. So it's part of the event grid. The event grid as part of the E agreement processor. And it handles the order placed. Handles order placed to C star does that makes sense.

**lance.fallon@llsa.com | 14:36**
Sense.
Yeah, and I was saying, did we want to just combine this with the membership one?

**Wesley Donaldson | 14:49**
Let's just keep them separate.
If you work on them together, feel free to move them. I want to make sure I could track the two different needs in Jira, but you can feel free to work on them together.

**lance.fallon@llsa.com | 15:01**
I question of seven, 97, 91.

**Wesley Donaldson | 15:04**
Let's do it. I have to leave in three minutes, so let's see if we can go fast. So 07:90. This is the conversation you just joined that meeting that we jumped out of. This really would need Jennifer to be a part of this conversation.
But what I can give you is what I can explain here effectively is we have a membership. There's a webhook and a hydration step, and then a detailed object gets pushed onto event, and gets pushed into current. Now that event will now have a reactor that will just push that raw event into that row event into SQ for that raw event. What are we actually supposed to do with it? Now that we have it, we're supposed to take it and actually create a match to the DTO structure of an existing C-star order event or existing C-star renewal event. This guy here...
So basically take that order, build out this object, and push this object into event grid. Does that make sense?

**lance.fallon@llsa.com | 16:08**
Yeah.

**Wesley Donaldson | 16:10**
Then the other ticket that follows that is... There's an issue with where it is. Where is the subtask? There's an issue with the participant ID, and this is probably for you, Antonio, but it just... I left it in last because it made logical sense. The issue is we're not actually passing the... It looks like the participant ID. The participant good is actually stored as part of the order object. The account object as a custom field. We're not passing that inside of the translation script that you're inside of your hydration.
I think you're dropping that. So we're not passing that custom object. So then in theory, we don't really have access to the participant ID. So this ticket is just to basically get that custom field to come over in your hydrated object.

**lance.fallon@llsa.com | 16:57**
Got it. So we might need some clarification there because we don't have a participant ID custom field at the moment in our sandbox.

**Wesley Donaldson | 17:08**
So... That's why we need David's... Because this is part of a larger ticket. If you look at it, it's part of a ticket that came in from... So this epic here has... They have already imported all of the orders inside of Rick, all of the members or the accounts inside of Recurly already, and they're supposed to, as part of that, have included the participant ID as part of that data import as a custom field.

**lance.fallon@llsa.com | 17:40**
I know you only have two seconds left, but... Are we accounting for new subscriptions that get created? So the import might include the good ID as part of this ticket.
But for new subscriptions that get created...

**Wesley Donaldson | 17:55**
That's a great question. I don't think that's clear to me. I apologize. I got a jump, but yes, let's raise that when we speak to Jennifer and to maybe David, so I'll set up some time for us to connect with them.

**lance.fallon@llsa.com | 18:04**
2.

**Wesley Donaldson | 18:07**
All right, or just messages out of the group chat that we have going, and let's see where that takes us. I guys, thank you.
Sorry, got to run. Right?

