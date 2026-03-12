# Architecture Solutioning - Mar, 10

# Transcript
**Sam Hatoum | 00:09**
And a. Hello. People.

**Wesley Donaldson | 00:15**
If, you know.

**Antônio Falcão Jr | 00:17**
Hello, good afternoon.

**Sam Hatoum | 00:57**
What are we hacking on today? Any fires first that we need to be aware of or otherwise good.

**Stace | 01:08**
Mostly good. I the still seems to be production issues caused by leg switches and not handling events. It is. Jenifer, is there anything we need to dump and jump into there?

**Jennifer | 01:28**
I think Michell and I are just working through trying to handle the event and from the past issues.

**Stace | 01:36**
Do we have a solution to stop it from happening in the future?

**Wesley Donaldson | 01:43**
We have y exactly.

**Jennifer | 01:43**
That the fix has already been in place? All right, that went in on March 4, which is why we saw that spike on March FIF especially for all of the CTAR stuff.

**Wesley Donaldson | 02:08**
Okay, there were two two and a half topics, that I shared in the agenda for the meeting I'd like to talk through. The first one is conversation. You, Elvis, Antonio. We've been having. Landsill contributed to this idea of do we want to have a dedicated order object that exists independently of recuurly that we use as kind of the parent object and then different foreign keys and have different identifiers that are connecting back to it for any downstream systems that order cracks with. 
So you all us prepared a diagram. And he can walk us through kind of the thinking.

**Stace | 02:46**
Okay, before you over shares, let me share something too, because again, that was always and we've talked about this in the past, right? Of course there's what we need to do. Again, I'm a little surprised that it was a question [Laughter] that we were going to internalize this because we talked about how the PG and the recurrly ID and things like that would play together. 
So within our system, right? And where we're legacy team members where I don't want you to draw a parallel to C Star is right. We're going to have to maintain like a participant object or stream, right? That would be all the data about the person who is being screened who accesses the portal, right? The entity that continues to come back to Lifeline to do business with us. Our customer will have to maintain individual orders that we're grabbing from recurly. I recuurly's nomen culture as the they treated in order. 
I think we're going to see invoices more so than orders right out of their system. Every time they settle a payment, we essentially get an invoice and all the details of the transaction and the current state of the order and that invoice. 
It's a little bit different in Legacy, but I think in this world, right, we have to have. There'll be a one dominion relationship, obviously, between two participants and orders, but there may be a many to one relationship between orders and a particular appointment or visit. 
And I think that's the important thing to think about here as we build. That is, we'll have our order or invoice invoices, right that are related to a participant. Those may be related to individual or the same screenings or appointment visit, which then would map to a screening. 
And we probably have a separate participant billing profile we maintain could be part of this, might be separate, could be used in different ways in the system. Does that all make sense? High level, yes. 
Okay.

**Sam Hatoum | 04:55**
Well, question, I guess. Sorry to me. Does the rest of the team.

**Speaker 6 | 05:05**
I mean, I'm calling.

**Wesley Donaldson | 05:09**
I you're all of this. I think the question is to you, like, how does this conflict or support the kind of conversations we've had this week around the dedicated order object sound like they are the same conversation?

**Stace | 05:24**
I know we do have a meeting upcoming. It's not till Thursday, but hopefully lockdown by the end of the week. As I'm trying to get various business stakeholders aligned so we can come back to each of these objects. Is going to have like essentially states that it can be in right ass participant active are they inactive are they marked for deletion by what's the life cycle for this? 
But what's the life cycle of an order like Curly is going to have their own definitions. And but how do we map that to how the business wants to think about orders, appointments, right? They can be pending, completed, canceled, right? 
So I'm trying to get all of that down so that as we map these objects together or that was a finding events essentially you have to listen to as things change these objects. But you can collect all the data from recurly without that, and we layer on all of their state. 
Right? Next.

**Sam Hatoum | 06:24**
You should probably chat about streams rather than objects at this point. Because the object is on our side, at least on the Thrive side, it's going to be very easy for us to project the from there. So more importantly, like, where. Where's our domain and stream boundaries? That. That would be helpful, but I'm curious to see like what you created. 
Sorry, go ahead, Stacey, you go to say something.

**Stace | 06:43**
No, that's what if you continue and I'm curious. Yeah, it was great. And I might be wrong about this. I kind of thought these would the streams and the objects are similar at this high level, but hoping to hear what everyone else thinks.

**Sam Hatoum | 07:00**
Let's see what you. Got you guys something for us to look at. Yos. Pressure.

**Yoelvis | 07:08**
Yes, and I'm. I was still drawing the diagram, but yeah, this is an overview. But pretty much the approach is like to control the order in this level when the user completes the purchase, we can create an order in your system, in your database, or event sourcing or whenever we want. 
But we quick create an order with all the information that we need. And we create the recording artifacts, the accounts, the PSES, everything. And we maintain this order. So when someone wants to retry or something like that, we already have the order information here it is 
And this way the idea is that we are gonna start creating the orders in our system. And we rely on Reculi pretty much for the updates of this particular order. So that way it will simplify our life in the TED and it's going to create like an order for this particular session and rely what hooks are going to be to update that order. 
And in this case, what we can have from this is uhh, predictable IDS because in this case, when we create the re recording voice, we are going to get the I we're going to set up the IDS in the accounts and everything in recording. 
So that way we control what are the ideas that we save in recording. We have already created a diagram with more details here, but this is the idea. It's like in our e commerce when the user TED to complete the purchase or retry or even retry, they are gonna send the information on the payment token BU information products. 
And then we create or load the order. In case the order is in your system, it's because it's in a retry or something like that. We just look up the order and update it, and then we have the order. ID participant all the information in your system. The order is processing. Then we ensure precury accounts. We create the accounts. We can create one account if it's the same participant info and willing info or we can create a parent shy relationship and attach it talking to the parent if it's the it's if it's different and then we submit the payment to recording. What happened is that in this step is when usually when we usually get errs. Sometimes the transaction is declined for the credit card is invalid or they don't have the phones or whatever reason. In that case the order is going to be failed. 
But we are returning the Erro message. We are storing that information in our system and we are returning that into the client so the client can retry using interrupt.

**Sam Hatoum | 10:34**
Sorry to interrupt. Sorry. I just need to. I'll be oriented just a tiny bit first, please. So on the left hand side there, can you highlight to me where like which system is what is, you know, recurly what is a endpoint, what is a land on our side or a system on our side? I'm just a little bit lost in this diagram.

**Stace | 10:51**
Actually. Can we just stop at the high level before we get too far to the right? You're going to do some convincing for me? Because it's not passing my smell test of why we would. If Curly is the platform that handles all ordering, why would we create an unfinished object at the same time or just before we do it and recurly? Why wouldn't we just listen to the web books to get to it? I'm worried. There's that one of two things will happen, actually, maybe both could happen. Is we're creating a synchronous event in an asynchronous system. 
And if and you've got two places things could fail or so fail, right? So we might have some drift and reconciliation to worry about.

**Sam Hatoum | 11:41**
That was kind of secular.

**Stace | 11:42**
Plus the cart before the horse. Like we don't have the order ID before we create the recurring account, so how can we have it at that first step? Right? There's.

**Yoelvis | 11:52**
Yeah, there are a lot of.

**Stace | 11:53**
We've got all our own keys. And then mapping to foreign keys. Right? I just. I just worry this is too much complexity or complexity is let the order finish and recurring. We just get it from the webbo now to retry it. 
I think this is AI think this is like walking around the block to get to the house next door on the retry. I think we can handle the retry in recurly that they hold out.

**Yoelvis | 12:20**
I just see that the way we are doing that now with recording is.

**Stace | 12:26**
It' tomorrow it's tomorrow, right? So there is no pad, right?

**Yoelvis | 12:33**
I think that the way if we try to move the business logic and all this information into the recorder is going to be more complicated because this way we control the business logging, we control what's going on with the order we can do easily.

**Stace | 12:50**
Look out want to right? This is why we're paying recurrently pretty sizable amount of money because it is like we're buying their system to do that for us, right? We don't need our own. The business doesn't have a stipulation what the order ID looks like. We have a participant ID, we got a map, but that's it. The rest of the stuff that I mean, just not really like you and that's what Webb are for.

**Sam Hatoum | 13:15**
I'm in agreement. Stays like in terms of you know like in where as much of what we should push to recurly versus what we should take internally. Hundred percent like we need to push as much as possible to reduce our operational overhead. 
And that's really the main concern. But I would love to just understand a little bit. Yvis like in whatever you were thinking here, like what was that? Like what is that there? Like ecomm is exactly what like when you say that there and then the next system, exactly what and why you think we should have it. 
So say so I totally hear you, but I'm curious to understand, like, the reasoning behind this, you know? But let's just walk through that real quick. Like, what are all the subsystems here? What are you expecting to do? 
And like, what's the outcome we're trying to achieve?

**Yoelvis | 13:55**
Yeah, I can. I can show you the document that Lens created that was kind of detailful. About all the issues we have at the moment because we are trying to use recording for order management rather than just billing. 
And it's being like more complexity than just handling this by yourself. But let me just go come back here. This is pretty much some. This is like everything here is the is handled by the graphq m mutation complete pushes mutation okay.

**Sam Hatoum | 14:39**
Okay this is all thrive everything on here is under the thr the thrive umbrella that's the like the deployment boundary exactly. Okay, cool, and we'll come.

**Stace | 14:47**
On the order that submit payment to recur a no, I guess it's a token, right? There's some client stuff there because again, none of that can be routed through our API gateway or our network, so ECOM can't. That can't be a gateway to graph to land at a recurly that has to be client to recurate the recurring. J yes, right.

**Sam Hatoum | 15:13**
And ecomm on the left is that recurring or is that an any like legacies or that's where I'm a bit lost.

**Yoelvis | 15:19**
This is right.

**Sam Hatoum | 15:24**
Okay, so there's a thrive UI like where you actually on or whatever.

**Yoelvis | 15:30**
And this year is the this fear is the endpoint, the imitation that we have. Got.

**Sam Hatoum | 15:41**
It, got it. Okay, now I'm tracking. And so SS that would be from the GRAPHQL server itself. Like we're sending some kind of token or something. That's the thinking here.

**Yoelvis | 15:51**
The. Yeah. The token is the one we get in the. In the client side, when you input the credit card, everything else recordly is creating a token. That's the token that we use for the server. If something fails, we just need to. The user will have to modify the credit card information and everything else, and it's going to generate a new token and it's going to use a new. The new token again with maybe the same or different information and it's gonna send that to the.

**Sam Hatoum | 16:23**
So you had a handshake with Rick Curly on the client side, it did all the dance. And now finally, it's the submit order. And now that our client is sending to our Thrive GRAPHQL endpoint a payload which includes a token that was the result of the handshake. 
And now we're saying, okay, we trust this mostly, but of course, there still needs to be a handshake in here with Curly to announce what submit payment to Curly does, and you get a success or fail. Is that the idea?

**Stace | 16:48**
Yeah.

**Sam Hatoum | 16:48**
Cool.

**Yoelvis | 16:49**
So address point like, yeah. So pretty much it's like the way we are doing now is we are having like a lot of orphan accounts. We don't have a proper way to look up for accounts in recording. So it's like we are just cul.

**Stace | 17:07**
I want to stop there. Their engineer gave us that solution already. When you submit the first time, the response has a recurring ID and that if there's any failure, you submit that ID back. And they have code that takes care of this, right? 
So your first try you get a account ID back from recurrly, then that stays essentially in scope for the rest of your submissions or retries, and it won't create the orphan accounts. So we don't need to build all this just to do that. 
And the other place this worries me is this again, this hasn't been exposed to any of you yet. But if. If we're kind of the man in the middle and maintaining our own state outside of the web. Plus, this really breaks any situation where we may want to lean into recur a their hosted tools and solutions, especially on the BD front. We're creating invoices, draft orders are placing orders entirely and recurrently where there may be no thrive UI.

**Sam Hatoum | 18:19**
So what? What?

**Stace | 18:20**
I think we should have to listen to the webs there and the web hooks only.

**Yoelvis | 18:24**
No, absolutely. We need to listen to the web hoop. I just thinking that this way we can have a smarter way to consolidate the web hooks with the order and we can track the order. But, yeah, and you don't have anything there yet.

**Stace | 18:39**
Right? You don't have the order ID yet because that doesn't come to the next step. We can generate our participant ID.

**Yoelvis | 18:51**
Yeah, this is more for. Yeah, but I know what you mean.

**Stace | 18:56**
You're gonna put a screening in there, but that's gonna inspire in fifteen minutes if the order wasn't completed. Like, there's some weird stuff I'm worried about.

**Yoelvis | 19:06**
So in this case, what's the plan with the. Webb? It's just like going here and say.

**Stace | 19:11**
Like out of the box webs always, right? We just listen recurrently processes the order, it tells us when it's done. An order gets updated, it tells us when it's updated. They process a subscription, it tells us what? 
Like that. Like, I guess I'd want a stronger case as to why that doesn't work.

**Sam Hatoum | 19:33**
Yeah, like if we just say the alternative that I think was you know, that what we discussed previously was that we do nothing on the Thrive side other than receive order created web hook that comes in it goes into our streams. 
And then from our streams, we basically start to figure things out, such as this reconciliation, what have you, all that sort of stuff you're talking about. That would all happen. And I think what we said last time was all events go as is into our stream as is. 
And that from Racurdy. And that gave us the you know, like the backlog of things that we need to deal with. And they just basically came in unadulterated. And then we had an anti corruption layer that converted them into our world of what an order is, and then from there we have, you know, a bunch of policies and things like that kick in and doing the event driven approach. 
So I think that was the expectation going into this, right? Stacey that's what you had in mind. Yeah. Okay, so things like it seems like that's a new proposals coming to say, let's actually do it another way. Great. 
Like absolutely you got to you got the space to talk about the proposal. But like what? Why is that? The. The first solution not sufficient and what does this solution offer in and above that? That's I think that's the main discussion here. 
So like what do we think is down below if you go or whatever. So your previous image was that you were doing the submit order that came from the client to us instead. What does that give us over? A what is lacking in the other solution of an event coming in that says order created from Brock Curly hits our event system and then from there we can carry out logic. How does this differ? What do you what's your thinking there? Or did you not know about that?

**Yoelvis | 21:12**
Yes, of course. It's a where I what? I understand about reculy. It's like it's very good for a it's a billing system. But if we want to track participants, we want to deal with orders. If we want to do all those things. Is our system the one who will need to take care? I see the value of using just web hooks, but can you let me know how do we plan to like create the final artifact like the final order here from all the web hoops and the one we send to sister?

**Sam Hatoum | 21:51**
Sure. So in. Correct me if I'm wrong, but in my mind, the way this would work would be an order happens on recurly. They do whatever they need to completely in recurly and you know, our front end says, okay, here's an order. Pings you over to them. All the packaging and like Skewus and things like that has all been preset up in Rick Early. 
And we get an event that basically contains. Like when we get the web hook, it says order created. That order created should have inside it all the information we need that. That allows us to continue the same way that when it comes in through the front end like to the GRAPHQL API as you were mentioning this that same information that came in there. We should have access to exactly that same information coming through the order created event. 
So before we go any further, is that a true statement? Does the order created event contain everything that the. GRAPHQL mutation would contain when it comes in from our front end in your design.

**Yoelvis | 22:43**
Yes, that's the idea. The idea is we let Reculi take care of the billing and subscriptions and updating those subscriptions and billings or whatever. But the participant ID payer ID screening, the appointment, the status. I was thinking that it's better for us to control those areas. We can't continue ing with what you already completed.

**Stace | 23:10**
I think that's where I'm drawing the disconnect is we will still control it, right? We're going to get all that from the web hook.

**Sam Hatoum | 23:18**
Because the web hook is like if you go back, we don't know.

**Stace | 23:20**
Before the web hook because we can't action on it without the being complete.

**Sam Hatoum | 23:24**
If you go back to your diagram 1 secvis, I think just to twist this into like the event driven approach. I think you can have your cake and eat it here. Like the one where it had the failure there it is. 
Okay, so that's my success and fail, right? So.

**Yoelvis | 23:38**
Sorry.

**Sam Hatoum | 23:39**
It's this it's it was similar enough. Okay, so at the end of this, like, the terminal state is like if you zoom out just in terms of inputs outputs on the left hand side, on a very left hand side, you've got the incoming order, which is the front end, right? 
And that's effectively mutation. So complete purchase or a retry, those are two mutations that come into our system, right?

**Yoelvis | 23:59**
Yes, there is one mutation basically those mutations.

**Sam Hatoum | 24:02**
Correct, is it just one purchase or retry is the same thing.

**Yoelvis | 24:07**
Okay, I just put the slash because it's to be used for both, but it's the same thing.

**Sam Hatoum | 24:11**
Okay? It in my mind, I mean, it's another pathway, so that's fine. Like let's just go on a purchase pathway. So purchase pathway comes in, you've got a mutation, blah in the middle, and then at the end we get order completed or order failed. Now in recurly land, what if this was done entirely in v Curly? Then you'd basically get one of two events coming into our system, like web hooks. You'd either get all the order created or the completed event, right? Or the failed event. We'd get something very equivalent from recury. 
If all of this happened in recuring now all of this being not the stuff you're mentioning there, not the you're doing some like the work in the middle here, if I'm understanding this correctly, it's trying to create, integrity, right, like data integrity, is that correct? 
Yeah, the only reason they do it is reconciliation and data integrity. That's the reason to do this. Okay, so whereas the alternative means that if we get an order created and we haven't reconciled it yet, then the problem that you're trying to solve here is to say we have an order, but we don't have the right information for it. Therefore we're now in a problem because it's too late, right? We should never have that order happen in the first place. Is that the general idea? 
Yeah, okay, cool. So, alright, so in the opposite world or in the sorry, in the alternative solution, we'd get, we would still get the events coming in, but this time it wouldn't have done any reconciliation. It would have been just events that says, you know, payment received or payment not received and here's the order details and so on. That would be the event coming inch. 
So then on our side, we would then say, okay, we have a successful order, we have the participant ID, et cetera. Let's now go through and do the same reconciliation. You're doing well, actually, sorry, two things. The first thing we do is we just log the event and we say payment received. We now have received payment for an order and that has happened. 
That's a fact. That's in the event store. We translate that into our language. So we're not using, recurdy language. And in our world, it will be order received for participant blah. That's in our event store. The next thing we do is then go through the reconciliation effort. We say, okay, now we need to create, you know, we need like higher up an external system that will be a policy when order received then modify other system as such. 
So we do similar steps to what you're doing if we need to reconcile. But I'd love to understand what reconcile is, what we're trying to reconcile precisely. But at the end of it, don't forget there's re models, right? 
So re models are going to be projections from the events, and that's where we have data integrity. So the only gap here is. And I'm not. I don't understand this fully yet. But the only potential gap is when we talk about the reconcile that's happening in the middle. What exactly is that? Is that purely on the re model side? Is it purely for us to have like, data integrity on the data we have internally, or are we reconciling some external system as well? 
That's the biggest question here, I think. So back to it's the one below, the one you showed me first with the two that exactly right, so those two no, one more, I think they want that one. The proposal, yeah. 
So inside here, like, when we say create a load order and then insure recurly accounts, what exactly is this ensuring and where? Like, is it a database, is it a table, or is it an external system? Like what's the integrity SLA insurance we're trying to get here?

**Yoelvis | 27:22**
I would assume this is if we are open sourcing, this is gonna be a projection, basically.

**Sam Hatoum | 27:29**
So we're trying to make sure that the data that we produce has like. Yeah. So I think there's a bit of confusion here. Like. This is looking at it from a updating projections, which you know you would not do from a GRAPHQUAL endpoint. The only thing a GRAPHQUAL endpoint mutation can do is emit another event. 
Anyway, there's no such thing as modifying a database. Like there's no. You can read from a database, but you cannot absolutely modify a read model from here.

**Yoelvis | 27:56**
But we can create a event. So s mutation, right?

**Sam Hatoum | 28:01**
Well, events or mutation means you record an event, right? So recording an event into the stream is recording a fact of something that happened, and then projections follow from that. Projections are never written to directly. 
So it's I think the thinking here is like if you're thinking about updating state somewhere, you never update state other than through projections. I'm just trying to understand this. This is good thinking. 
Like this is a really good litmus test. What this is like helping us prove our solutions. So this is really good work. Thanks for bringing this forward. I'm just trying to understand precisely, like, what we're trying to reconcile. 
And. And if it's purely just to make sure we've got data integrity like, where would the whole happen here? Where could we end up with a place where we don't have a participant ID matching or we don't have a screening ID or something like. Where could the information not be present?

**Yoelvis | 28:50**
Yeah, alright. No, that's good.

**Sam Hatoum | 28:54**
I that was a question. Sorry, I thought it wasn't rambled on a bit and I eluded the question.

**Speaker 6 | 29:01**
I have the I guess I have the same question, right? I guess if we are. I mean, I don't know. I'm assuming. Are we deriving a participant ID from the point of I guess like checkout in our new e commerce solution.

**Stace | 29:18**
In this case have our participant good after the web hook and web hook.

**Speaker 6 | 29:24**
Into CSTAR.

**Stace | 29:27**
Yeah, no, I'm use the same we use the same guy generation and thrive.

**Speaker 6 | 29:32**
Got it. Okay, so then, yeah, so like the thought here is we're creating a new participant every time, right? Like it's just gonna be a new unique identifier that's flowing through.

**Stace | 29:42**
Per person though we haven't gotten to that story of how D duing them but okay and thrive right? We're going to have to. That's going to come up as soon as. Like we have to build this web hook mechanism. The first step would be. 
Well, you already did it, right? We can get an order in the recurrently now get the data out of recurrently. Now process it. And as part of processing it, we're going to have to look at kind of essentially a hash of last name, data, birth, email, phone.

**Sam Hatoum | 30:18**
They right.

**Stace | 30:19**
Does it exist in the database? In which case you're merging this order to an existing participant. If it doesn't, you're creating a new participant.

**Sam Hatoum | 30:28**
Do they sign in at all or any anything like before it even goes to Curly, though, like, what do we know about them from our when we're on track.

**Stace | 30:34**
To begin 100% visitor.

**Sam Hatoum | 30:36**
To hundred percent visitor. Okay, but would they send us some details into the so effectively we're just going to create a participant for them when that order gets created?

**Stace | 30:47**
Yeah, but we will have to again. That won't be a low day. One problem but something we have to account for, right, is when they come back and place an order. We had to build to match them with something in the system. There's actually going to be a UI component of that we're going to build into the recurrly flow and a like an asynchronous call as they're entering like their payment information. Once they type in their email and phone number, they have to make asynchronous calls and look for those.

**Sam Hatoum | 31:17**
Well, I don't nothing we can tell.

**Stace | 31:18**
The Curly in the flow. There are stores that ticketing apps do this particularly well right now is to let you just check out with no friction to log in. But then suddenly the tickets, like in your account at the end.

**Sam Hatoum | 31:30**
But what they do is they give you a confirmation number, right? Like you can come back and get that confirmation. So, like my question then is there an opportunity here for us to at the, client side, when we first create this order, we ship a, like a confirmation number, effectively that we issue. 
So then we pass it through Curly. I don't know how much Recurly supports this, but if ideally, we could ship some metadata from our client to this to the Curly, account, and then they have a confirmation number for us, right? 
And then, they can store that and if somehow that can appear in an email that the user receives. Let me think about this. Actually, no. So the much easier way, sorry, I'm thinking out loud. The easiest way would be we get the order created. When the order created comes in, we're going to send them an email right from our system. Is that a correct statement, or is it purely going to come from RECU? 
Yeah. Okay. So when we send them an email, we basically create a participant there and then an unclaimed participant. And that's just has to be an event. Like, we don't have to. Like when I say create. I just mean we record an event that. There's an there's a participant that was created with this confirmation number and they can receive that confirmation number and then, you know, they receive a link in that email. 
So the next time they want to sign when they do want to sign up for an account, they have two things. They have a confirmation number they can use to look up, or they have a URL.

**Stace | 32:52**
It's get too complicated for our 85 year old customers, so it's got to. I mean, the 20 year old system does this, we can do it even better and drive. I think this will just work, right? When we adjust the endbound, we can see if the participant exists. 
If so, right, there's no participant to create, no cognito account to create, all that kind of stuff. We just add the order. The person doesn't exist, we create the participant. All the rest of the events happen for a new participant. Said person does not have to be involved.

**Sam Hatoum | 33:34**
Okay? I mean.

**Stace | 33:36**
I think we're jumping farther ahead than we need to be right now. Let's focus on how we're getting the order. Auto re correlate, next call we can talk about. What are we doing with that data?

**Yoelvis | 33:45**
Yeah. So basically in this case, we are going to go with web hooks. We have to reconstruct all the businesses. Stay after we get the events, and then we go from that.

**Stace | 34:00**
Right? Okay?

**Yoelvis | 34:02**
And then. Yeah, and then we need to figure out when the order is in is ready so we can send it to sister as well. Sister yeah, I was thinking this would be simplifying that, but I see the value on.

**Stace | 34:19**
If we do a better job of explaining this. I'm and I'm pushing back pretty hard on this now, right? And it's my style of. Yeah, I'm e events when you come back with a strong argument and. And I'm actually, I mean, I'm intrigued by this. 
And while I'm reluctant to do it now, I'm not saying never. I think. I think we should focus on the web hooks if there are gaps or if a business reason comes up. This seems like a very easy thing Toyer in. 
But even with this, we got to get the web hooks right. So I think let's focus on the web hooks first. And if we need this interim case where we're staging the order as we currentlyase process and year before a process again, it seems like kind of an easy iteration to add that as a next step.

**Speaker 6 | 35:10**
Yeah, I mean, what it just seems to be is trying to get a jump start on that eventual reconciliation process by adding a bunch of control data right ahead of time here, instead of relying on what would eventually come right now as like a legacy little lead event back from CSTAR and then reconciling at that point.

**Sam Hatoum | 35:33**
I mean, there's nothing to reconcile. There's just history to record. Like, there's just a quick, very quick way to think about this. Like you don't want to think about reconciing from the get go. You don't want to think about the reed model. The reed model is like, you know, ephemeral, completely ephemeral. Reed models are produced as needed. We can produce them directly on the fly from events or we can have them stored somewhere as data. 
But like, you just want to get out of the. It's difficult, it's really difficult to shake this like thinking that you've been doing for tens of years, which is that, you know, crud is telling you to just go update data. 
But we don't do that here. I mean, we up we just store events and then the data is free. So it's a difficult thing to. And I'm glad we're doing this today because it's like teaching everyone like the you know where exactly how and where it starts to creep in. 
But you don't want to be updating state in a database here. What we're saying is like this event happened now as a result of all the events. I can project any model that I want. Now does that make sense? Now that we're looking at all this together?

**Yoelvis | 36:30**
And in that case, with the event sourcing, how do you know that something is ready to send to another system that we gathered all the information that we needed about subscriptions, about invoices about because we have to gather different events to create the payload from sister.

**Sam Hatoum | 36:52**
What you have is something called the decider pattern. And the decider pattern receives an any new event that comes in. So let's say you know, you're waiting for five events to happen. The first event comes in and it says, okay, I the current state of the system means that I shouldn't do anything yet. 
I've only received event 1 of five. And then the next time it comes and. But now that state has been recorded. I've received event 1 of five. The next time. Event 234 come in and it says, okay, the current state of the system says, I've received four events, but I'm still waiting for the fifth one. 
And then finally when the fifth one comes in and says, okay, I've decided now, given the state of the system, says all four events have been achieve received and now I'm receiving the fifth one. I will now decide to do the action. 
And so that's basically how you have like the decider pattern decide for you. And so you build up state as events come in. And as events come in, you build up state. State plus an event means that you then take an action. 
And that's the decider.

**Yoelvis | 37:49**
Yeah. And I want to say, I was trying to follow some of the best practices. It's not like Revenge of the W. And it says that for example, we should rely on post API responses rather than web hook for some actions. 
It is more reliable and things like that. But. But yeah, well.

**Sam Hatoum | 38:09**
That is a true statement.

**Jennifer | 38:11**
But could we like get a web hook that gives us the final state and then we do APIs to fill it in?

**Sam Hatoum | 38:21**
I think the problem is bigger than I think it's slightly above that. Like it's what happens if you don't receive a web hook. Like, you know, there's the web hook delivery, right? So, all people all, APRS that have web hooks typically come with, web hook deliveries and retries and things like that are built into to recurly. 
But that's a very fair point. Like, how do we know that we received all the web hooks? We've got to make sure that we stay on top of that, because missed web hooks means missed orders. What is a post tells you there and then. 
So absolutely like that's a valid point. You know, in terms of like knowing like the assurance that the web was done. So one thing you can do is we can definitely rely on Rick Curly doing its job by letting the user know that they received the order or not. We can guarantee that like they've taken care of that flow. 
But whether the web hook then it comes out of recurli. All we need is a regular checkpoint with Curly. If you like to see that. The health of the web hooks, if we're receiving them all or if we have a problem on our side, I think that's a very valid callout that we need to take care of.

**Wesley Donaldson | 39:31**
Do you have a perspective on how is it just simply using the API to make calls? See what orders like maybe the web hook has a sent or a sent acknowledged, like we have the API for them. What's what mechanism do you propose using? Just an a chron job that just calls and checks one.

**Stace | 39:48**
O no.

**Sam Hatoum | 39:49**
Yeah.

**Stace | 39:50**
But the Webb is just a notifier, right? So it should be web hook to API gateway to a lambda that processes the web hook puts the queue in the appropriate like the SSQ right? And then another LLaMA will say will be notified. Hey, this data changed, go to the API and query it out. There's no reason we should have to continually poll like recurring, right? Recurrly will tell us if something changed. We notify the system that's responsible for getting that data. It goes and gets it. Does that make sense to everyone?

**Sam Hatoum | 40:31**
It does. I think there's still a gap, one gap, which is what if we never received the web book in the first place? The delivery failed, right? I think. And that that's kind of like the big one if we received it. You're absolutely correct. 
Like it goes into, you know, the queues and dead letters and things like. Like it's now in our domain. But what if it never got to our domain in the first place? It got to Curly and it never got to us. 
And that's the gap. So I think, you know, for this one.

**Stace | 40:55**
Let's worry about happy path and then we'll come back.

**Yoelvis | 40:58**
Sure. Yeah. I think in that case you will see the here you will see the fail the failed ones and you can free them and even retry manually. They do some retries a automatically like send re tce if none of them were successful, you can hit the button here to be try manually.

**Sam Hatoum | 41:18**
Yeah, so exactly there's that management you just need to be on top of this. So all we need is just like some alerting slash. I mean, they should have alerting built in. They'll send you emails, like they'll give you Slack notifications, all sorts. 
So just making sure that all of that's hooked up so we can take care of it.

**Yoelvis | 41:34**
Let me ask you, where do we get the appointment to it from?

**Stace | 41:41**
It will be as a custom field and probably the, I forgot where it landed. It's either in I think it's in the employees paid because that's where you have your list of what was purchased and the appointment good will be linked to an item that was purchased.

**Wesley Donaldson | 42:11**
We have about 15 minutes not to stop this conversation. But Antonio the ACL I think that's another point we want to just collect get decision clarity on you want to just touch on that really quickly. 
It's very much related to this. You all. This is last strong question of how do we get the orders into the Cstar system?

**Antônio Falcão Jr | 42:34**
Yeah, sure. The point is related to ACL how intelligent we intend to make that so in my understanding, the electrifications coming the Roy event coming from recurrer may need some enrichment. And do you guys believe that the a CL would be a good place for us to reach out other streams to gather more information to make that domain event more meaningful for us? 
And once we have the opportunity to reach back to Rick Curly, when we get the web hook together a bit more information V API at the same way we can at the s circa ACLP side, gather more information from our event streams is that does that make sense for you, Sam?

**Sam Hatoum | 43:26**
But yeah, I mean, I think you're like, yeah, you can, either translate it directly if it has all the information built into it, or if you need to reach out and hydrate it some more. The ACL would be a good place to do it as long as we are still receiving the raw events as is and recording them without fail. 
Like there's no reason for that. Then, you know, we can the transference of that event into and in, you know, a domain event that is enriched. Yes, enrichment would happen as part of the translation of creating the a of the event like into our domain. 
So yeah, definitely the right place. But is there anything to do with the question, is it just a case of, like, remapping or are we enriching? And if we're enriching, what are we enriching for? Those are the open questions.

**Antônio Falcão Jr | 44:19**
Yeah, we have a work we have a specific task to address these mapping issues or these mapping fields in the phase two. I just wanted to make sure how extendable this a CL should be. But, yeah, that. That. That makes sense. Enrichment. 
It's supposed to be part of it and one more part. Let me share my screen, make it more like it's related to the Easter event, so I almost there. Okay, good. So basically the idea is to have these, whatever ACL component, preparing or formatting these order event C Star so we can take advantage of all these flow and make this be propagated through our system. Am I assuming that correctly?

**Sam Hatoum | 45:22**
Can you play that again? Sir, I didn't rock it one more time.

**Antônio Falcão Jr | 45:26**
No problem. Let's assume DISCONNECTOR here is the a CL component and we are preparing or formatting the disorder event for car. So am I assuming that based on this diagram, that we intend to achieve this event schema and then just push it to be taking advantage from all these system propagation. 
It is existing event processing that we have in place for CSTAR.

**Sam Hatoum | 46:03**
Looks like it stays.

**Stace | 46:07**
Yeah, I think so. Yeah, there will be an idea of right achieving consistency within Thrive right once you have is. Dany maybe you'll help me phrase this better, but the pretend C Star has a list of whatever it is. 48 required fields, right? Once those fields are in for an order in case they have to come from various web hooks and recurrly or ST changes and thrive or whatever. Once they're there, right, there'd be a projection whatever we omit that event to that service that's then going to push it to CTAR did that help?

**Antônio Falcão Jr | 46:49**
Yeah, absolutely. That was my point. And yeah, one additional question on this. Do we intend to include some metadata just to track if these events, these order events are coming from recurry or Shopify? On this endpoint.

**Stace | 47:08**
Yes, we will know because in that kind of the way it works today, right in that list of required fields is some data that will tell CSTAR where it came from.

**Antônio Falcão Jr | 47:21**
Okay, good know.

**Stace | 47:23**
Yeah. Yeah.

**Antônio Falcão Jr | 47:24**
Wey. Do you see anything else I should cover on this matter, please?

**Wesley Donaldson | 47:29**
I guess the handling of the metadata would be the other point. So yes, we know that it comes from Shopify. There's, let's say, arguably some kind of event handling downstream that deals with that. Is there anything downstream that would need to be updated to support it? Coming from Rick Curly, is there any events, is there any alerts, anything like that? 
Because what I feel is missing here is like the direction around observability like whatever is existing, the existing event grid, all of that downstream system doesn't arguably doesn't NES know, about recurrly orders. It shouldn't need to, I guess. Is I guess the core element there maybe answering my own question. 
But my worry here is what actions do we need downstream that are specific to recurrly?

**Stace | 48:17**
I think that's as we get into the or we create those stories. I think calling that out is good. There is a convoluted but there is an error system, right? Or if things can't be inserted into CSTAR, they go into queues that can be processed and people can look at it. That may be able to be improved. It certainly can't be broken, right? 
So it has to work at least as good as that works today. I think largely it's going to be other than changing the source fields, it shouldn't break a lot of the system, but let's keep asking those questions. 
I think this is a good train of thought.

**Speaker 6 | 49:00**
I mean, states your point? I think it's only the source field, right? Yeah, that we would probably have to propagate inside of Star DB and it's one of those heavily relational fields that's sitting on another table, right? 
So you're really only sending in a primary key, but that primary key has to then kind of handshake with one of those other tables as recurring.

**Wesley Donaldson | 49:23**
Yeah, I think my worry here is the lesson learned from the from last week, this idea of are we expecting a clear typed object that has like a specific value and that value triggers some logic downstream. 
If it's looking for a conditional on. If it's assuming that there is only one chop I order in the system and now it sees to. How will it handle it? Is there any logic that this.

**Stace | 49:46**
Yeah, that part of CSTAR luckily we're not really changing it, right? It's already kind of got an idea of where it thinks orders can come from. So we'll be adding a new one. Yeah, the hard coded value is as far as, like, thrives concerned, right? 
It's just going to layer this on top of every order.

**Wesley Donaldson | 50:07**
The other one that I didn't think we touched on yet, the idea of breaking out 10% of the user base will go to recuurly the other 90 to shop fire just to control to do that, is there anything from a CDK perspective that we need to support that, or is that already a load balance?

**Stace | 50:21**
Yeah, again, excellent questions. So the idea is, trying to get this finalized so OPS can get all their work done so then we can add it to CDK. We will launch this under another domain.

**Wesley Donaldson | 50:33**
Okay, there we go.

**Stace | 50:35**
Screening. 
It's not lifeline screening dot com. Probably won't be that because we don't want screening twice, but so it'll we'll launch this in addition to the Shopify store. So in this case we luck out. We don't have to build the ad switch. The social media team will change a set of ads to the click through. We'll go to the new domain as opposed to the old domain. We'll make sure it works. They'll do another set, and then we'll probably just do a full on redirect where Hardt House we'll just go to the new domain.

**Sam Hatoum | 51:07**
That's nice.

**Stace | 51:08**
Right? So here we don't have to build that sampling mechanism. We'll just do it through a distribution. Right. And changing the functionality book where you go when it comes.

**Wesley Donaldson | 51:20**
So then, Jennifer, I think we've said multiple times there would be an opportunity to do a quick ecom 3. It sounds like that would not be necessary. Correction we need to create the site. 
But there's nothing else in this box that says I've been gen. There's nothing that need to built be built there.

**Jennifer | 51:34**
So EI was actually just about to come in. So ECOM 3 is basically, the API like. So when we were talking about like, layering the order on and everything like EC 3 is built or EC 2 is built for Shopify so that you can just send it one payload of an order and it does the things like participant matching and some other like things before it actually saves that order. Is that not what we're wanting to use?

**Stace | 52:09**
No, we will. So let me go on to the same.

**Jennifer | 52:15**
So there are some questions that was like, is there processing like so there is a difference between ECOM 1 and ECOM 2. So like regular like our legacy ECOM and Shopify where Shopify has a little bit of logic built around because we aren't using those tables that Dane was mentioning.

**Stace | 52:37**
So this is.

**Jennifer | 52:38**
This is my thoughts.

**Stace | 52:40**
And when we get to it. I mean, in a perfect world, we just take whatever that code is and fork it, right? There's no reason to be dry here, but I guess the.

**Jennifer | 52:50**
The econ that we're talking about.

**Stace | 52:53**
Yeah, my director do before it is if there's any code level change at all. As to what Shopify's doing, I'd rather not introduce that risk. Like there can just be a zero percent chance that something we deploy ahead of wanting to launch re Curly breaks Shopify.

**Jennifer | 53:12**
Where I'm going with that, right? That's not what I was trying to. Yeah.

**Stace | 53:17**
So any of that right, should happen here as we're streaming into current and the connector, like preparing that object for everything this expects should be able to happen here, right? It's all on how you're projecting it to be read from.

**Jennifer | 53:33**
So I think that is that change a question correct. And someone just asked a question of what it's doing. And so I just wanted to be clear that there are a bunch of like steps. It's not just storing the data. There are things that is happening on the legacy system that are side effects throughout this econ. 3. API that we're going to be calling with one payload.

**Wesley Donaldson | 54:00**
So that's the I'm still unclear, unfortunately. Like it sounds like there is no ECOM 3 API or rather it's not for phase one. Phase one. It sounds like it's just the event ingestion and the formatting via the ACL that pushes in the events into something that thestar existing system right where Stacey's pointer is currently understands.

**Jennifer | 54:25**
Where his current pointer is isn't thrif. So EC API, which is Econ 3 is the way that we're getting stuff into CTAR so that like in the middle of the screen is the separation between Thrive and Legacy and between that we should only be passing in one payload.

**Wesley Donaldson | 54:35**
Gotcha's hear then. 
And Jonor, are we clear? Makes sense.

**Stace | 55:00**
Yeah, so for Antonio Cea again, CS Star old system, it's very transactional, right? It kind of has no idea. There are things we call events in there, but not really events, right? It's a transactional system, so there's no idea of like eventual consistency or even listening for stuff, right? You're just you've got to prepare all the data for it and shout at.

**Sam Hatoum | 55:24**
Yeah. Then looking at the looking at that when we've got the connectors going to order event for CSTAR, it's not so much an event as much as it is just a policy, right? Like we have a yeah, the events that come there with that Easter or Lamba is effectively a policy is what we're saying and it the connector calls that policy with an event of an the Order event. Just that it's not really order event for C Star, it's just order events, isn't it? 
Right? And then C Star order is actually just a policy.

**Antônio Falcão Jr | 55:52**
Correct? Yes.

**Sam Hatoum | 55:53**
Yeah, IA correction, but like, it's not so much that these are because it can be confusing for someone to look at this and say, like, what's a C Star event? But it's not, it's actually just the order event and then when order event meets certain criteria, then send it to please stop.

**Stace | 56:11**
That's it.

**Jennifer | 56:12**
Yeah, exactly. Yes. Do we want to write that down? When the order I when the order event meets criteria, then we pass it.

**Stace | 56:23**
And there where this comment comes in is that might be some new observability we need is what if an order never meets 100% criteria because we have because it happens in Shopify, right? But we handle that on the CTAR side. In this case, the event would never get CEAS our side, so we would have to make it observable on our side. 
You know.

**Jennifer | 56:44**
That's a good point. And I actually like that better because right now we're making it on the CSTAR side and like this weird way where we're sending it to like this SHAREPOINT log. And I would much rather have some better alerting or observability that we can share in a dashboard format or something.

**Stace | 57:04**
Yeah, the share. And just for the team's awareness. So what happens right is if that post fails, right? If Star throws up on it or refuses to accept the order for whatever reason, we log it actually gets pushed forward into Microsoft SHAREPOINT, and the reason for that is then an actual customer service representative can see the text of the order and try and get it into C Star in a manual way.

**Jennifer | 57:31**
And I think like after we designed it that way, we kind of going back in hindsight, I wish we would have done all of that in the Thrive side before we send it on. So I much prefer this method.

**Stace | 57:47**
It's time to get something over there. Because if it only lives and thrive, right? We can't be typing. And it'll.

**Jennifer | 57:55**
It'll still be set up like that. That'll still exist because again, we're just copying EC two over to EC 3, so that'll still exist. I just would rather it not be the first like line, so. So let me get it.

**Stace | 58:15**
Go ahead. I'm sorry.

**Sam Hatoum | 58:17**
I'm finished your thought.

**Jennifer | 58:21**
I sometimes ramble. You're good.

**Sam Hatoum | 58:24**
So I think we need one thing then if I'm hearing that correctly. So the connector comes in we get orders order event like order events come into this policy. The policy says yep, you meet the criteria. Therefore, I'm going to send you to Thrive. 
That's it's so to C Star. But we have we want to make sure that we've got deliverability and all that sort of stuff. It sounds like we just need a queue then to send the stuff there. Like it's the policy is one module which then puts it and gives it to a sender if you like. 
Like a C Star sender. Let's call it that. And a C Star sender has a queue of items that it receives, and then it has a dead letter queu and notifications and all that. Sounds like that's what we need.

**Stace | 59:03**
Yeah, that would be good.

**Jennifer | 59:04**
I godly an event great on the other side.

**Stace | 59:08**
Yeah. Event bridge. The event bridge to event grid integration kind of gives us as dead letter CES if we have that your ability. If the two are able to communicate right, then you can resign them.

**Sam Hatoum | 59:20**
So you're saying between CSTAR, like between the policy and ECOM API, that's going to be an event bridge connection is that.

**Jennifer | 59:26**
The squares are around them. They're kind of set up as queues.

**Sam Hatoum | 59:34**
The e com API has a que already.

**Jennifer | 59:37**
Yeah, the event grid.

**Sam Hatoum | 59:38**
Yeah, okay, cool. All right, fine, so if that's there, then we can just send.

**Stace | 59:42**
The grid is kind of Azure copy of a event bridge. The very EAs link the two. They actually communicate through each other via ARR call, right? But it's treated as a message going through a queue. Am I exaggerating? On that date like this house. No.

**Speaker 6 | 01:00:02**
That that's what it is. Yeah.

**Wesley Donaldson | 01:00:12**
No?

**Jennifer | 01:00:13**
As you guys get to the event grid side and everything, if you have questions on that, let me know, because I was like part of it as we were doing it the first time, so. Okay, good to know that we got it.

**Wesley Donaldson | 01:00:27**
So just a minute.

**Stace | 01:00:28**
Yeah, but again, it's just a little buffer there, right? So say CTAR slower at processing events than Thrive is at sending them, right? Then Event Grid gives us the ability to stack those up and they eventually get processed and things like that.

**Wesley Donaldson | 01:00:41**
So just to clarify, just a restate for everyone.

**Yoelvis | 01:00:42**
But talk about.

**Wesley Donaldson | 01:00:44**
But this the ingestion looks good ingestion epic looks good, the consumption after ingestion. We will need an effort around cloning the existing EC to API. We'll need an effort around making updates. Specifically. It sounds like to maybe the policy the C star order. Landa maybe that policy statement there. 
Maybe not to get the recurrently specific orders through into CSTAR. 
Jennifer that probably is a question for Wesdce.

**Yoelvis | 01:01:25**
Yeah.

**Jennifer | 01:01:25**
Sorry, I'm okay. So yeah, the consumption after the ingestion, everything. We only need the effort around cloning the e com 2, we shouldn't need any effort around changing it. I'd actually prefer that for the first iteration we make no changes because like, it's working right now for Shopify with no issues. 
And so I'd prefer the least amount of changes until, like, we're ready to add on new features and we've got it stable.

**Wesley Donaldson | 01:02:01**
Yeah, I think my concern is you mentioned that there are specific changes or specific optimizations within that layer that are not available coming. Basically, it's customized specifically for Shopify to make Shopify a bit more efficient. Those customizations in theory would not be appropriate for recurrly unknown they will be.

**Jennifer | 01:02:21**
They will be, yeah.

**Wesley Donaldson | 01:02:23**
Okay.

**Jennifer | 01:02:24**
So we're copying the shop if I one exactly because the customizations that were made were the legacy e com. Basically, it does what you all us was like trying to like kind of talk about at the beginning where it does that order management and the card management on the server side in a database and since and then it takes that database to send it over to like all of the different things that it needs to do. 
And so since we don't have that process happening as we're making the checkout, we have to do it all at once. So the customizations that we made around the existing like the original e com API is to make it where you're doing all of those steps. 
So it's very transactional, as stay said. And we're making sure. Like it does the participant matching it does. Like e like each of. Like it has to cart the item in order to make a checkout.

**Wesley Donaldson | 01:03:25**
Makes sense. Okay. And the only other thing that I think we talked about but we didn't like cement is. Stace mentioned that within the UI flow of Recurrly, there is already a mechanism the engineer has already provided the current engineers already provided that deals with not creating duplicates in the system. Stace, can you, your office maybe you can connect with Stas and just find the specifics of that and we can create a ticket. 
Because I'm going to assume that that's not in the current checkout MVP flow. Because since you mentioned duplication being a challenge of why you. That proposal was put forward.

**Stace | 01:04:00**
Yeah, I think what we have to add, right is on any call where you're gonna create an account, you'll get a account ID back from Curly, right? Then we'll have to add that to a local storage object. So if you have to resubmit that account, you do it with that account ID. Then recurly system will say do I have this primary key already? 
And it'll kind of handle that failure case for us. But yeah, Albert, yours and I have some time today, so we can talk about that and make sure. But it should be the sound everyone sound like a relatively simple loop to add back in.

**Wesley Donaldson | 01:04:39**
Cool. We've covered all of the agenda itemss.

**Sam Hatoum | 01:04:42**
Yeah. Okay. So if anyone has any questions going forward, especially like as you get lower into the projections and what have you, feel free to reach out. I can hop on a call anytime. And anyone else, please let me know.

**Stace | 01:04:54**
And this is a very good, productive discussion. So I'll kind of reiterate to the beginning. And I know I pushed back and ask a lot of questions about everything we've said, but I don't. This is exactly what the team should be doing. All the time is coming to the table with, you know, should we be doing it this way? Can we look at it in a different way? That. 
That is the spirit of this architecture meeting. And I like it.

**Sam Hatoum | 01:05:17**
Would have been a lot worse if somebody got to those questions while developing. Hey.

**Stace | 01:05:20**
No, right? This is the time to have those discussions. And like I said, even what we talked about with that inter order thing, what you have always presented, even if it's not what we're doing in this particular epic, might be something we that we identify use cases to layer on, or maybe even be necessary for some sort of lead gen or abandoned cartflow or something that we might tackle in the future.

**Sam Hatoum | 01:05:44**
We agreed. Agreed? Well, thank you, everybody, a great day.

**Wesley Donaldson | 01:05:48**
Thanks Se.

**Sam Hatoum | 01:05:49**
Awesome. He guys.

