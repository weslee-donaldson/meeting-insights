# LLSA, Eng Recurly process - Mar, 10

# Transcript
**Yoelvis | 00:01**
Floration with the we hooks.

**Wesley Donaldson | 00:03**
Good morning gentlemen. 
Can you guys hear me?

**Antônio Falcão Jr | 00:15**
Yes, I can hear you. Yeah. Sorry. I was looking to my phone track.

**Wesley Donaldson | 00:19**
Looks like you're talking, which means I probably can't hear you hold on second. Okay, say something else please.

**Antônio Falcão Jr | 00:31**
Ye. Can you hear? Now.

**Wesley Donaldson | 00:32**
Yep, good, thank you so much. All right, let's jump in. So as I shared just two topics couple in general the all related to the same idea. 
And I was just talking to Antonio offline about this. Actually, Stace had mentioned something. I think that's probably the most important thing. Had mentioned something yesterday as part of the refinement call, and I think Greg had chimed in and supported it. The idea of going live on the by the end of March. I don't. I don't want to dominate this call with that, but I want to make sure that you guys have that top of mind. You always have you in your one on one with Stace. Is there more that you can share around? What? What he perceived that would look like.

**Yoelvis | 01:22**
No. We haven't talked about the deadlines or anything.

**Wesley Donaldson | 01:25**
Okay, yeah, it's kind of where I'm at.

**Yoelvis | 01:26**
Now?

**Wesley Donaldson | 01:27**
So it was a bit of a surprise. I think the previous conversation I had heard close to a launch date was something in June and I wasn't sure. I'm not sure if that was end of June or beginning of June, but I am very confident. I heard June, but that's fine. 
So let's pause on that. I think we need to have a conversation in architecture of what that means, how are we're going to support that deadline. So let's just pivot to what this meeting is about. So two things. One wanted to talk about the larger conversation of all of the things that you've shared your Elvis from that integration document. Things around what our interaction with the backend should look. Interaction with users into recurly would look like. Things around what the integration would look like, how we should be setting up our web hook. How like recurrly telling us how to build our system effectively. 
So I want to make sure that we're clear in all of those directions. Distill them down to actually things that we can do right? We're building this epic one that we're supposed to be doing this week is intended for setting up the ingestion process. 
And then next week or mid next week, we're going to be talking about everything after current ingestion. So very important, we are clear on it. There are additional functional requirements from that document that we have not tracked. Does that makes sense?

**Yoelvis | 02:47**
Yes.

**Wesley Donaldson | 02:51**
Okay, so how do we want to I can take that document and distill it down into here's what I think are features that we need to implement, and I can do a simple mapping and just say put it on a board for us to look at it and have a conversation about each one. I'd like to use the architecture meeting this afternoon to tackle something relative to this concern. 
So one concern going into architecture is going to be this idea that you put forward your lance put forward around we should own the core object, we should set up a basic order object and then have all of the other foreign key associations from whatever system be tied to that. That way we have better transparency and ownership into what's happening in recurring love. That idea. We had conversation around is that a projection and how we're using those projections. Is there anything else that needs to be said there to get us into the architecture conversation? 
Like you obvious you were going to tackle like a super rough diagram that's a illustrating that point.

**Yoelvis | 03:57**
Yeah, we are. I think we are good.

**Wesley Donaldson | 03:59**
So you're so you already I didn't see anything there. Maybe you put it in a different location. I didn't see anything on the board, but maybe I missed it. Or is your expectation just you're gonna just well, I see you, I see what your mouse is, you're just gonna walk through what you're hovering over, it is.

**Yoelvis | 04:12**
Yeah. No, to be honest, I thought it was for this afternoon the meeting, and I just saw you put it in the morning, and I said, okay, because yesterday I had, you know, my life is kind of, meetings and meetings.

**Wesley Donaldson | 04:21**
Yeah. Sorry. This is for us to.

**Yoelvis | 04:27**
So yesterday after in the afternoon, II spent the afternoon meetings. And today I was in meetings with lence as well. So I haven't had the time to put together a diagram, but I think the one you share is doing. 
It's a it's the same idea. They ask you one.

**Wesley Donaldson | 04:47**
Yeah, do you mind if I just take that for you?

**Yoelvis | 04:48**
We can't just throw a few boxes here and make it per. But yeah, feel free to do it.

**Wesley Donaldson | 04:56**
I'll just take that ask and turn it into a Miro, so I'll take a pass at that.

**Yoelvis | 05:01**
I can help you updating or whatever, but I haven't had the time to be honest. [Laughter].

**Wesley Donaldson | 05:07**
Yeah, noise that's. I'm here to facilitate for you guys, so let me take a pass at that. 
I'll get it on the board. And then we'll just use as the conversation. And that's going to be the answer to discussing the. We own the order. Great. The other one I'm concerned about is what I just mentioned. 
Like a lot of documentation. And I know you kind of run through probably whatever the hell Claude or whomever you run that through. So a lot of read out there. But I want to be more intentional. I want to be like this. This feature set needs to be supported inside of our implementation. We have Epic two next starting next week, or a refinement for that next week. I want to get ahead of it this week. 
So if you haven't had much time to put thought beyond what you shared, that's fine. I'll. I'll like. No, we can just close the meeting and say we'll. We'll get to that, but I'd love to see if we can distill that down a little bit more to like, we need to build this alert inside of AWS, we need to do this projector inside of current like that's the level I think we need to get to.

**Yoelvis | 06:12**
Let me BA chair here so I can ask, Antonio some questions.

**Wesley Donaldson | 06:18**
No.

**Yoelvis | 06:20**
So the main idea here is that. See? I'm not super familiar with these two. Okay. It's like we're gonna have the e commerce and then we will have the complete purchased. 
So when the users complete the purchase, we're going to generate e an order and then we will create a stuff. I don't know how to artific. Recording is gonna take care of, you know, the subscriptions, the accounts, the invoice. 
So pretty much the invoice is what matters the more for the order. So I would say invoiced. So when we generate an invoice, this order is going to be successful. Otherwise it's gonna be in a status that could be something like something that is not successful, it could be in faith strus or it could be in starting or something like that. 
So we probably need to have some startus here for the order. And then when at this point, I was talking with Lens that it's probably the best place to put the to send the order to actually sister because here we have all the information that we need. 
I mean, we don't need to necessarily send it to system, we can send it to a queue or whatever, and COR is going to take care of the queue. But it's just like here we have the whole picture. This is the entry point for the order. 
And in my opinion, the recordly way hoop should be to update the order if it's necessary. Like. Okay, let me move this here, because it's probably more like this way. Curing. But the thing is, like I think that in e commerce, we create the order, we control the order. We have all the information about the order and the reculy invoice and artifacts related to that order, and then we send that order into the recorder. 
And Current can take care of creating the order in CS Star and getting the projections and everything else. But in case something changed. I mean, Recorder for me is just for changing something. Let's say you go to Recorder and you change the user information like the billing address, something like that, or the subscription. In those cases, we just continue with the web hook. 
But web hook are gonna be for updates, not for creating stuff. That's my approach, and I want to get the feedback to see. How do you envision this one? Yeah.

**Antônio Falcão Jr | 09:59**
Yeah, it's quite similar, as you could see. We don't have web hooks. We don't have order specific web hooks on the recurrly side, right? And, yeah, if I'm mistaken, we do have a task to specifically address these, work on the phase two because, yeah, part of this work you. Designed will be made via ACL and the ACL will create. 
So the actual domain events that we will react to so the real meaningful events in on our perspective will be designed from the ACLI is that makes sense. But yeah, your assumptions are pretty much aligned with what we need.

**Yoelvis | 10:55**
Absolutely. It's like where we talk, it's like we are trying to keep this step here and go directly to re recording. But I think if we do it this way, it's gonna be an over complication to. To understand. 
Because then you have to tie all the pieces together to create the order. And we already have that information here. We don't need to create a lot of web hook overhead just to get an order. And then you will need to identify when the order is completed because you got all the pieces and then send that to system. 
If we. If we have all the information here, we can just create a mutation, create the order, and you can do everything else. It's gonna be way simpler. It's like if we delay this for a later time to phase two. Something like that. 
It's gonna take us. Like. More. It's gonna be much more complicated just to work around this in the phase one.

**Antônio Falcão Jr | 12:04**
Yes, I do agree we should present this to the achector meeting and get some insights from them. But yeah, I agree. It's a good path to take. The only thing I believe they will want to preserve is the a CL concept, because the complete purchase, for example, not this one specifically, but, charging voice paid, maybe the web hook that will give us this insight. I'm not sure. 
Right now. But it's not part of our language, so we may want to clean up this concept first before we react to it, but it's more of the implementation of the Tao besides of the a CL first or being the middle or not. I do agree your concept it's is well aligned with what we need. 
But what do you.

**Yoelvis | 13:02**
What do you mean by ACL?

**Antônio Falcão Jr | 13:07**
ACL is the company that will translate the web hooks into.

**Yoelvis | 13:14**
Anti corrusion layer. Okay.

**Antônio Falcão Jr | 13:16**
Yeah, tribe specific domain events. That's it. Yeah.

**Yoelvis | 13:20**
The anti crusal. Yeah, it's like it looks fine on paper, but in practice, I don't see an easy way, you know, to translate the information we get from recoing into something meaningful because there are multiple events, multiple web hooks. 
But if we do it here, it's a mutation, it's just simpler. And this ACL is gonna be for updates it's my approach for this.

**Antônio Falcão Jr | 13:53**
I understand your point. My concern is just that now this curator mutation is now being triggered by something from a domain, an external domain from our business. And the idea they introduced was to react to, you know, internal domain facts. 
But once again.

**Yoelvis | 14:21**
I just ask you. What do you say? This is Sternna. This is or e commerce. 
This is th.

**Antônio Falcão Jr | 14:41**
I see what you mean to make that lie okay to make the order purchase right away we okay now you are introducing the order aggregate in our system. I think it's what your point now we don't have this yeah I see now I'm sorry yeah we don't have this right now. We can present and I like the idea of having an order on. On my side it was the team. Yesterday's team discussion right? To introduce the order life cycle on our side. 
And then we can manage the order and react to whatever we have. So yeah, it's still a good idea.

**Yoelvis | 15:21**
We will have appointment go the if the recorder, IDS, everything else, everything we need. We have it here at this point, and we know when. When you have like an event, a web hook, you know how to identify that web hook to an order because you only need to update the order because the order is gonna have the I Ds and everything from recording. 
So when something comes from a webhook, you know what to update or what to project? Something like that? No.

**Antônio Falcão Jr | 15:56**
Yeah, absolutely. I understand. I just don't remember entirely if states have some concerns on introducing order a new order a component or a new order aggregate on the tri e commerce side, if I'm not mistaken, was his idea this diagram and to make this, straight integration. 
But, yeah, once again, let's present it to them and let them, put their concerns and see what happened. But I agree. I like the idea of having the order life cycle on our side. We can control it. Absolutely. 
Yeah.

**Yoelvis | 16:41**
No, I think this is we are evolving our understanding of everything as we go. And I think State would be aligned with this as well because the first idea was just to rely on recording. But it's gonna be overcomplicated because recli business is billing. Recordli is not in the business of controlling the business logic and, you know, the identity of the user of the order of the sessions, all those stuff and appointments, those are business knowdge that we need to control.

**Antônio Falcão Jr | 17:19**
I do agree. Yeah, I had the same impression on my research over the webbooks. Yeah, they don't have good web hooks or any web hook actually specific to order they only have for the payments, the purchase and yeah, that's true.

**Yoelvis | 17:43**
Older than that. I noticed something in the. Wesley in the best practices and in the documentation. It's about this thing here is like for the computing the let me ask you something do are we charging taxes for in the pricing or it's not included.

**Wesley Donaldson | 18:09**
I do not know that. We' need to confirm with Stace. Actually, with probably, Greg and Beth.

**Yoelvis | 18:19**
Yeah, but either way, for many reasons, it's recommended to use this hook that is going to we know we send the payload. This is a client side thing. We send the payload to Recordli with the information we have in the card, and Recordli is going to compute the totals and everything for us. 
So it's gonna be based on the recording information. It's gonna come from the API and I was thinking that. And this is going to compute the taxes. If we go to Recuia, we compute we say we total taxes on for whatever reason because we want to share taxes. This is going to compute that automatically. 
So pretty much I think we need to replace the card that we have right now with this. And it's straightforward. Instead of us computing the values, we just send recordly the everything the same thing that we send in the wagon at the complete purchase that same object. We send it to record when we do modifications in the front end, and Reco is gonna give us all the numbers for the checkout page or the checkout summary. This is important for many reasons. I was doing a research and it's for compliance and for many other reasons. 
And we can avoid mistakes by doing the calculations manually. For manually? No, but in your code. So this is, just a suggestion. Maybe we can approach the checkout, section using this component rather than computing, like, manually.

**Antônio Falcão Jr | 20:13**
That's a good thought.

**Yoelvis | 20:18**
This is the React one. You know, they have the documentation, the proper component there is the building block for this. But this is the one that we are gonna use because we are using REA frequently. 
That is very convenient. It's just a. It's a hook very simple that it's going to give us all the information. This price is not prices including all the information, the subdoral, the total, the taxes. Everything that we configure in recording is going to come from this object. 
And we only. We only need to send the payload with the SEL the user selections. And it's gonna be computing like, dynamically even for the coupon. If we have a coupon, we can send a coupon. And it's going to give us the this information with the discounts for the coupons and everything else so we can avoid mistakes, you know? Got it? 
Yeah. What do you think? Wesley.

**Wesley Donaldson | 21:19**
I again, I think it's fine. I think my big worry is just getting these decisions buttoned up solid. I like the idea of like Stacey's general direction is do it the way we currently wants you to do it. 
So this is aligned to that. I agree. I just need to get to a distillization of what all the things that we need to do are. So if we need to use like this checkout prop this use checkout pricing, that's something that doesn't exist currently in the system. We need to add that in. 
So I would see that as another epic that we need to add in. Sorry, another task we need to add in. For retrofitting the existing UI experience, which is fine. I wrong with that, but like I think we were all part of the call where we heard the new timeline that was given. 
So we need to get clarity from the business how real that timeline is. And then we, as the leaders from the engineering perspective need to figure out how can we what changes can we make that will align us to best practices but make the deadline.

**Yoelvis | 22:25**
Yeah. I ask, like a cooler and they say the this is important by he I but yeah, I agree with you. The I think the only my I mean I think having this done is critical and is very important. 
And the interaction with Star we need to unless did some research on that. We need to understand what's the shape that we need to send to sister so we can create the event or whatever this is. But we need to make sure we collect all the data that is important for system, you know, and that way we can create the SYSR order.

**Wesley Donaldson | 23:18**
Agreed.

**Yoelvis | 23:20**
But other than that, what are we missing here for the end of the month other than this?

**Wesley Donaldson | 23:28**
Well, what have we done with this? All we've done right now, in my mind, is, yes, we have an order inside of Rick Curly, but we haven't done anything on this side. 
Like we haven't done the ability to actually create the, I should I actually I'm confusing myself. Do we need to actually integrate with Cognit? I'm not even sure now do we what do we need to do to support the customer service on the backend? What do we need to support for? 
Like we, Jennifer mentioned creating e com 3, right? Is that what's the point of that application? Is that servicing just the customer service folks? What do we need to do to kind of make sure that the C Star has all of the understanding of how the order like my worry is all we've done all we've talked about to date is just everything before the order, and now we're having a conversation of how to support injecting that order, into our downstream system like we haven't. Designed. That out yet? 
That's. That's why premature.

**Yoelvis | 24:29**
That's a good point. Yeah, we need to think about this. Yeah, about the after pushes. How do we deal with the user?

**Wesley Donaldson | 24:40**
Exactly.

**Yoelvis | 24:41**
Are we creating?

**Wesley Donaldson | 24:41**
There are other systems here that we haven't even talked about relative to recurring, and maybe the answer is once they're in C Star, everything else solves itself. 
I doubt that's the case. 
It's things like, okay, well, how are we what's the integration with interval looks like? Is it we need to pass in some identifier saying this is a recurring order? Is there anything that we need to do there at all? We use Cognito currently first creating our accounts, but recurrently has the idea of parent account and a child account. Does that mean we no longer need Cognito? Cognitive does more than just order, it helps us create the log in instances like for allow each to log into the site. 
So then is recurring giving us that capability? How would we get to that capability in recurly? Do we still need Cognito users then? And then we have to have a relation between the account created inside of recurrently with the account created inside of Cognito. All those are questions that have not been answered. 
And that's just off the top of my head.

**Yoelvis | 25:33**
Yeah, absolutely. We need to answer those as soon as possible. And I in my understanding we need conito of course because we need user to be able to authenticate at some point and we need to work on that new system as well because they need to authenticate someware to see the results. 
Right now we have a system to for the result. So maybe we just need to create a knito identity so they can sign in into that website and that's gonna be it, right?

**Wesley Donaldson | 26:00**
But.

**Yoelvis | 26:10**
Probably. 
I don't know. That's gonna be a Star. Something that's gonna come automatically from Star, or it's something we create. But it shouldn't be that complicated. We just need to align.

**Wesley Donaldson | 26:38**
Yeah, I don't disagree. I just want to have the conversation. The thing that I care the most about is like that conversation doesn't get better and we have it, and so help us have the conversations. What I might ask to you guys, we need to go into architecture and that's the place to have these conversations. We should go in there with a perspective. That way the conversation doesn't just likes like us spinning our wheels. 
So you're obvious, you have a strong perspective around us owning the order. Good, perfect. I'm looking for that on the back half, and if we don't have the time yet to think about that, that's fine. Let's just. We'll set up some time to maybe just block your calendar. 
Say hey. Come up with a rough plan of how our existing implementation after orders are incurrent and then what needs to be duplicated mirrored like updated, adapted, ported whatever the term the right term is to get us to support recurrly orders be past getting the order into current. 
Like the conversation that we've been having around the projections like what the order structure, is it going to be normalized or denormalized? That's great conversation that actually I think informs the what does it look like downstream? We need to have that conversation. Relative to Cognito, relative to CTAR, relative to iterable, all of the things. 
Let's keep it manageable. Let's bite off what we can bite off. So for today, for architecture, let's tackle the idea of order, right? So I think tackle the idea of us owning the order and what that means if it's getting a participant from CSTAR, like literally getting creating an order, pulling some identifiers at the time of ingestion. Let's have that conversation. 
And then the other thing I'd love to make sure we touch on as part of architecture is give space the space to give us the date of end of March. And then let's react as a team. I'm curious what Sam's perspective is. Let's react as a team on what we need to do to support that. Those are the two things I want coming out of architecture.

**Antônio Falcão Jr | 28:47**
Okay? Sounds good.

**Yoelvis | 28:50**
Yeah, perfect.

**Wesley Donaldson | 28:51**
Okay, let me give you guys 15min back. I know meetings are getting a little heavy, so please spend some more time in your back of your mind thinking about what the downstream looks like. And then after maybe sometime tomorrow or Thursday, we need to have another conversation around our. Our proposal for what that looks like. 
Okay.

**Antônio Falcão Jr | 29:10**
Deal. Okay, bye.

**Wesley Donaldson | 29:11**
Nices, guys. Right.

