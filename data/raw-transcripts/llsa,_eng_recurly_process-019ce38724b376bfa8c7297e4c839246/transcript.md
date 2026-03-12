# LLSA, Eng Recurly process - Mar, 12

# Transcript
**Antônio Falcão Jr | 00:35**
Whoy? Wassley.

**Wesley Donaldson | 00:40**
Let's see, we actually... Let's give me a couple of minutes.

**Antônio Falcão Jr | 00:47**
Actually, it was lit to Brazilian, right? It's just like Disney.

**Wesley Donaldson | 00:50**
Can you guys hear me? Okay, good, I feel like my audio is hit or miss.
Are you guys missing Jeffco?

**Antônio Falcão Jr | 01:08**
8.

**Wesley Donaldson | 01:15**
Be meaning info copy needs to talk over the Jira curly CDK task.
Sweet. All right, thank you guys for making the time. If you need to drop... No worries. Okay, so jumping straight... Antonio, the hope for this session is...
I saw you gave a very detailed response back to Lance. So Lance, hopefully that gets you most of what you need. But I wanted to pull together this session just to give you a chance to walk through the thinking around what we talked about for recurring order ingestion.
So maybe just pull up the mirror and just talk the team through that and then gives the time to just JFFco Lance. Hopefully, that'll give you much of what you need from your tickets perspective. But if there are questions or concerns, this is the time to raise some of those. Let's make this an interactive session.
And just to clarify, the expectation here is we're not going to introduce anything new. This is really just a conversation around... Absolutely give me a second. This is just a conversation around what was already agreed to from Stacy and Sam, Antonio, and you, all of us from the architecture meeting. This is just...
So I think this is more about onboarding and clarifying questions as opposed to new work. Let me start the recording to you, Antonio.

**Antônio Falcão Jr | 02:49**
Thank you. Let me share my screen now. Those things you can find it enough.
So guys, the idea here is to at the same time be able to integrate with recurring order ingestion without changing or affecting it in any way the Shopify side. And for that we have a few... How can I say? Strategy.
So the first one is to introduce this CL concept and the AC concept is pretty much to preserve our language boundaries. So for sure, recurrently, it's an external application that has its own language. We can see a few webhooks. I would say a name in here that is not fully compliant with our internal system language.
So the idea was to completely isolate these integration levels from our application from recurrently. Then we realized that the subscriptions are notification only, so they don't have enough information, different from Shopify that they have good information on the events. We don't have that on the record side.
That is where the idea of persisting to store the webhook events as raw events by retrieving extra data from... Sorry, Wesley, see you.

**Wesley Donaldson | 04:51**
Start? Yeah, maybe it's towards starting from the beginning. Remember that Jeffco was working on the CDK stuff for ingestion and Lance was working on the LLaMA function for actually taking in the webhook, doing the enrichment from recurrently.
So maybe starting on what are the events that we expect to come in, what is the... We talked about doing an API gateway as the entry point, taking it a little from the beginning.

**Antônio Falcão Jr | 05:22**
I thought I was... [Laughter] There, but okay, no, it was the ingestion.

**Wesley Donaldson | 05:25**
I thought what you were really describing was more the ACL, which is after ingestion, right? Okay.

**Antônio Falcão Jr | 05:36**
Yeah, but let me get another, maybe yeah.

**Wesley Donaldson | 05:44**
Yes, there you go.

**lance.fallon@llsa.com | 05:45**
It made sense to me, but... Okay, yes, okay.

**Antônio Falcão Jr | 05:48**
Okay, this is the idea. So pretty much, as I was saying, we do have those webhooks to track what is going on the recurrently side. And via an isolated specific web API gateway, we're going to ingest those webhooks and... Supposed to process those hooks by enriching them and retrieving more data from recurring.
Right? The idea... And then we persist those raw events in the current DB and the idea is to have the recurring raw events stream on our side, either to reprocess them if we need or to provide a triggering some reactivity on our side to react for those raw events with a specific connector that will make the business language translation to these events.
So the expectation is that this ACL be able to reach across the streams and gather information that we have already and prepare meaningful domain events so then we can properly react, consume it for projections, and consume it for side effects on our application and have them as a source of truth from this flow to achieve the order placed event that Krisp is expecting.
So we can't just hydrate whatever topic or queue Krisp is consuming now and then we can make this order build on the recurring be propagated across the system without any change on that side. Let me get into more details.
So some reasons for that. The hooks don't have enough information. They are notification only. That's the reason we have to read back recursively via API ATTTP request and ask for more details about that specific one.
Right? So for example, subscription created a data concealed. We have only the subscription ID for example. Then we have to go back and ask, "Hey, give me the subscription payload so I can have this information on my side."

**lance.fallon@llsa.com | 08:33**
What if I asked a question now, or do you want to get through the whole thing first?

**Antônio Falcão Jr | 08:38**
Yeah, you can. Yeah, sure.

**lance.fallon@llsa.com | 08:40**
Okay, that was one of the questions I had marked down. I didn't necessarily discuss this in the chat with you. I see the benefit of reaching out to Krisp in that web LLaMA only because it's really up to whatever's handling this downstream what it's going to truly need.
So if we get an invoice paid LLaMA, for instance, come in, we can query the invoice out of Krisp, but whatever is handling that invoice to actually go and create an order, it's going to have to make subsequent calls to Krisp anyway to get numerous other pieces of information.
So by reaching out to Krisp at the web level, it's almost just an arbitrary guess of "Let me just get some information. Not really having any idea of what's actually going to be needed though off it.

**Antônio Falcão Jr | 09:49**
The had. Okay.

**lance.fallon@llsa.com | 09:54**
So I know for a fact that "invoice paid" if we just look up "invoice" that's what's on the raw stream, that won't be anywhere near enough for an order, your main object, for instance.

**Antônio Falcão Jr | 10:12**
Okay, but that makes sense for you that we don't have an order object, right?

**lance.fallon@llsa.com | 10:16**
Well, it won't have enough for anything, really. It just has high-level invoice info. So whatever handles this downstream, it's going to have to make its own recurring calls anyway to get whatever else it needs.

**Wesley Donaldson | 10:32**
So can you say more there?

**Antônio Falcão Jr | 10:35**
YP.

**Wesley Donaldson | 10:36**
So can you... So the invoice paid at the time it hits the Lambda. So we get the webhook at the time it hits the LLaMA. Is the idea that there is not enough time on the recurring end? Or is the idea that there are additional steps that the user or this recurring system is processing where we have to wait x duration before we can actually get all of the information relative to the paid event?

**Antônio Falcão Jr | 11:03**
No.

**lance.fallon@llsa.com | 11:03**
I just don't know what we would want to save in that raw stream. So when we say we'll just get the invoice, I could just query the invoice and get that. But I know that whatever is going to need this downstream, it's going to need more than just that API/invoice call. I don't know specifically what it'll need, but to get line item information, that'll be a separate call to get plan add-on information that will be a separate call. To get coupon redemptions on an invoice, that'll be a separate call, right?
If it's a parent-child, there's going to have to be an account API call to get that information. So each of these events, we could make an arbitrary call. We get a subscription created. Just look up that plan and save that. If we get an invoice paid, just look up the invoice and save it to the Ross stream.
But it just seems arbitrary, in my opinion, versus just saving the web event that comes early.

**Antônio Falcão Jr | 12:19**
Okay, but what about the resilience of this work? So we get the web hook and we try to get back to recursively, and the recursively is not available at the time. What should we do?

**lance.fallon@llsa.com | 12:36**
I mean, that's a separate issue. So you're saying we get the web hook comes in and we query you saying downstream or in the web candidate downstream. Then I guess you would have to reprocess that event. I guess that would have to be considered a failed.

**Antônio Falcão Jr | 13:05**
I understand your idea.

**lance.fallon@llsa.com | 13:06**
To wrap a part of the event.

**Antônio Falcão Jr | 13:09**
I understand your idea to simplify the process. So you're going to avoid these redundant persistency streams and then just react to the hooks and get back information from recursively. Whatever we need and hydrate whatever we need to push events.
That's your idea, right?

**lance.fallon@llsa.com | 13:28**
Well, I mean, still save... I guess still save the body of the web that comes in to that raw string. What you were mentioning in your comment, we get that event off the web, which has a body. It's very slim. We would say that we would save that body to the raw stream, but alongside that, we would save an additional payload based on what that web hook is.
So if it's like a charge invoice, it would be the raw web hook event, that slim table plus whatever the response is from looking up invoice out at recursively. I'm saying that second piece, I'm not sure it is entirely necessary.

**Wesley Donaldson | 14:33**
So hold on. Let's make sure we add one additional piece into the conversation. Could you go over to the right? One of the things that we are trying to do here is there are two phases for this work. In phase one, the expectation is we are effectively using all of the downstream CTAR systems, the account management system EP, basically all of the systems that we have after ingesting that order, are going to remain the same.
So we need to be able to support both systems being live at the same time. To get to that end, we are effectively pouring all of the recurring information into a format that is understood by the larger downstream system, so by CTAR.

**lance.fallon@llsa.com | 15:20**
Yeah. I think that sounds like phase two of what we're talking about.

**Wesley Donaldson | 15:24**
So that's epic two, not phase two. So epic two is start.

**lance.fallon@llsa.com | 15:28**
Play every but.

**Wesley Donaldson | 15:30**
Yeah. So yes, 100%. I think my question to you, Lance, my challenge to you would be... Let's keep that in mind. If you're saying that the downstream system should be responsible for determining when it needs to pull item-level information or... Or give me the list of the items on a particular order. The membership information, the account parent versus child...
If you're saying that the downstream system needs to take care of that, my question to you would be, "Does it currently do that? How would we pass the capability to do that in a system that already exists that understands all of the information being available currently within the current?"

**lance.fallon@llsa.com | 16:15**
Okay, and I mean... That's fine. Again, my point is just that then we will have to define for every one of these web books the full depth of information that we need across the board.
So I... That was one of my questions on the ticket, "What do we mean by fully hydrated?" And it was kind of well, just look up the invoice if it's an invoice, web just look up the subscription if it's a subscription. Webb if that's not the case, then we do have to define what is considered fully hydrated because it won't be as simple as just I see an invoice web hook come in, look up the endpoint.

**Antônio Falcão Jr | 17:12**
If we need extra retrieval, I don't see it as a problem. So the point is these Lambda is placed here either to support the need...

**lance.fallon@llsa.com | 17:25**
If we need extra retrieval, that's not going to be an issue. Won't be an issue where...

**Antônio Falcão Jr | 17:37**
Won't be an issue because this is the reason that this Lambda exists. This Lambda exists to retrieve data from recurring. This is the main work it has to do, and the idea is to isolate data from and language from external systems to internal systems.
So it has multiple problems here. It looks redundant, and it's intentional. It must be... Because we don't want these contaminations to come from outside. We want to isolate this technical component, this phase one, these three, these four components here are the phase one to provide for us this encapsulation.
So from here, now we're going to consume richer events from recurring, and then we're going to translate those events into meaningful events. So I don't know. In order to react to those hooks, I believe this is the best place to do that. The limit is the best place to do this reaction for those routes.
But it's intentional, right? We are not trying to make it shorter or simpler. This process is intentionally having this as a backbone because it has resilience, it has that retry use we can try to get to recurring if recurring is not available.
That's okay. It's going to... It's going to that letter. We're going to reprocess that letter, and then we...

**lance.fallon@llsa.com | 19:16**
If we have the invoice side that is saved in that event stream, and that's what we're reacting to downstream. Like, isn't that enough to get everything that we need?

**Antônio Falcão Jr | 19:33**
I don't know from the invoice endpoint. Only one request to get everything from... Is your point?

**lance.fallon@llsa.com | 19:41**
No, I'm saying if we have the invoice ID, we can get at every other thing that we need just based on that.

**Wesley Donaldson | 19:47**
Down.

**Antônio Falcão Jr | 19:48**
From where? From where from Recurly? Yeah, that's my question. I don't know. Do you know the answer? I don't know yet. If it's enough.

**lance.fallon@llsa.com | 19:57**
I mean, not enough to make a create order event. That's definitely not enough, but we can get everything possible out of Recurly that we can based on an invoice number.

**Antônio Falcão Jr | 20:09**
Okay, we can reduce those hooks to only one. ROI, I understand your point, but now we are consuming this hook internally so there is no language boundary protection. It was the intention. We can talk with architecture again and suggest them to give up on these language protection capabilities. I don't know, it was intentional to have it here, but yeah, we can discuss that.

**lance.fallon@llsa.com | 20:42**
Okay, yeah, I thought the first step of this was saving raw events out of Recurly and then having some connector handle those raw events.

**Wesley Donaldson | 21:02**
So two questions.

**lance.fallon@llsa.com | 21:03**
And that and the shape didn't necessarily matter what head was me.

**Wesley Donaldson | 21:11**
So from architecture, the conversations to date, we've mentioned this idea of hydration multiple times. So I'd rather not go back to architecture because I believe this has already been solved. Hydration.
I think what's missing here is what is the definition of hydration based on each event type? And remember, we have a decider down the stream, right? That down the process which can pull together like...
Okay, cool. I need to wait for AI... Don't know. A created invoice paid a account, a subscription set up like whatever the additional events are, all those things must come together before we can move on to injecting the order for before we create our own create order event that CTAR understands.

**lance.fallon@llsa.com | 21:57**
What you s yeah, keep hearing CR I'm not clear on that either, because if we see an invoice paid like everything is atomic when we create the purchase and recuruly there won't be really be the concept of do we have enough yet?
If we see invoice paid, we have enough like it. It doesn't matter what's come before, what's come after it.

**Wesley Donaldson | 22:23**
Hey.

**lance.fallon@llsa.com | 22:23**
By itself, that means that somebody placed an order. They have an account, they have line items, they have a plan, et cetera.
If that makes sense, just by the nature of how Curly handles the purchases.

**Wesley Donaldson | 22:59**
Let's keep going. So maybe in Tony's talk about what you envision the decider would be responsible for and how that conflicts with the idea that it's atomic. Everything fully available once you see paid.
I guess I'd ask, "Do we even care at this point?" If we focus primarily on injection ingestion, is that a problem for us in two weeks or in a week and a half?

**Antônio Falcão Jr | 23:42**
Okay, moving forward. So basically, the idea is when we receive an order paid, it be translated into a recurrly order paid, richer event. So the ACL will make that something like an order placed event, and then that order placed event will be triggering the core side.
Then the magic happens inside there. So the flow is the same we have there. So the whole idea is to get on the very same event shape to allow... To start making the order in processing on their side.
Let me see.

**Wesley Donaldson | 24:40**
Okay, I think we haven't actually answered the question, and I will ask the team if we need to bring this back to architecture or not.

**Antônio Falcão Jr | 24:40**
It's pretty clear. JAS, yeah.

**Wesley Donaldson | 24:46**
Or just at least posted in the channel. It sounds like the underlying question is, "Do we want to get all the information available on an order, and what is that information at the time we actually get the webhook, and we process the webhook like if we get order subscription, that order creates a subscription, that order to create events comes in. What should we reach out to recur to pull back because we... It sounds like we agree that we're not going to have a downstream need to actually go pull that detail-level information. We don't know what that is yet."
The current Krisp implementation doesn't support the time... We need to go pull that at runtime when the Krisp rep is looking at an order. We don't need that. We would need to get currently Shopify hydrates everything that's stored in the current store.

**lance.fallon@llsa.com | 25:43**
Yeah. It would just be a matter of one... We're hydrating that Shopify event to... That's going into the event grid. At what step is that happening? Because that would be the point at which we could make the additional calls to Krisp to get everything that we need.

**Antônio Falcão Jr | 26:04**
Yeah, but that's the point you are not getting. They don't want to do that. They want to. They don't want to have recurring details inside of our business code. That's the reason this component is split them those universe.

**Wesley Donaldson | 26:22**
Hold up. Before you answer that, let me respond to that. LinkedIn is on the visual right now. You see where it says ECOM to API?

**Antônio Falcão Jr | 26:32**
Yes.

**Wesley Donaldson | 26:33**
So I'm not clear as to what's all inside of here. I guess my question would be, what you're describing, does that additional hydration happen inside of the ECOM to API?
I think no.

**lance.fallon@llsa.com | 26:46**
Now what happens prior to going into the inventory?

**Wesley Donaldson | 26:48**
Perfect. So then I think we're saying the same thing. Then we have no choice. So then what Antonio was saying is correct. All of the hydration needed has to happen at the time it gets pushed on the current when we receive the webhook.
Whatever those payloads are, even if we create new events for them, we have to get them at the time their webhook was processed.

**lance.fallon@llsa.com | 27:10**
So then maybe that's my question. Where is this mapping to the event? He just Shopify DT doing because I didn't think that was the webhook for Candler.

**Antônio Falcão Jr | 27:23**
Okay, that part is right here. So this is a CL, it's a connector. So it reacts to the raw recurring events and it can retrieve data from our existing streams and then create order-placed events or whatever signature. This event has their sister side.

**lance.fallon@llsa.com | 27:53**
The shop ofif shaped d ter that creates on the event grid?

**Antônio Falcão Jr | 28:00**
Yeah, pretty much.

**lance.fallon@llsa.com | 28:02**
Okay, so that's the step that I'm saying we're going to have to do a ton of mapping at that level anyway.

**Antônio Falcão Jr | 28:10**
Yeah, but it's part of phase two. Yeah, you are correct. We have that in place for phase two. Okay, if I'm mistaken, let me open the... I think I shared the...

**Wesley Donaldson | 28:32**
Can you go back a little? So is the real question here, Lance. You're trying to get to. What? Should I pull back based on each event, each hook that comes into me? Should I always?

**Antônio Falcão Jr | 28:42**
Yeah.

**lance.fallon@llsa.com | 28:42**
My thought is that whatever service is responsible for generating that... Do that we send to the event grid is going to have to do a lot of legwork anyway. It made sense in my head for that. Whatever service that is, whatever layer that is, whatever phase that is, that be responsible for...
If I need more stuff from recurringly, then I'll go get it. As opposed to the web, we hope just sort of guessing at what something is going to need downstream. Because if I do... Invoice 197 on the raw stream...
Something gets that downstream and then goes to make that DTO that we're going to send to event grid. It can at that point build up whatever it needs, including what it needs from recurringly. Now we could again, we could prepopulate it on that raw event stream if we want, but we'd be guessing at whatever how it's going to be used.

**Antônio Falcão Jr | 29:54**
Downscreen.
I completely agree. I completely see your point. I just think it's a different path from what was defined. We would have to discuss that, Wesley, if we intend to take that into consideration.

**lance.fallon@llsa.com | 30:22**
I mean, do we know what we have seen? Have we seen the event DTO that we're talking about that Shopify DTO?

**Antônio Falcão Jr | 30:32**
I started...

**lance.fallon@llsa.com | 30:33**
I think we pasted it in the...

**Antônio Falcão Jr | 30:36**
Yeah, I started this phase two research recently because we are focused on the phase one so far by doing the ticketing and getting better context on it and so on. So I have a bit of fragmented information about that.
But yeah, I shared the markdown piece of my research on the matter. So I have to double-check if that is the actual event shape.

**lance.fallon@llsa.com | 31:10**
I'm not going to hijack your card. Do you mind if I just steal the shere for like 20 seconds? So I'm not talking in the complete abstract, but this is the event order deto that I'm talking about. So it's very it's a very Shopify specific DTO and it's going to require some very heavy mapping.
So obviously this is not something that the web Candler would be responsible for, but something downstream would have to create this Shopify object with all these very specific properties. I think I might just ring back to the point which it sounds like you're saying it doesn't necessarily matter.

**Antônio Falcão Jr | 32:12**
No, it does. And you are correct. We need to do that. The idea is to have part of this data coming from Recurly and part of the data this data coming from our existing streams to compose this event. You are correct.

**Wesley Donaldson | 32:30**
So we have a task inside of Epic 2 that talks about exactly this.

**lance.fallon@llsa.com | 32:34**
That might be a challenge because we don't have a participant yet created, so we can't really look that stuff up onto the existence screens.

**Wesley Donaldson | 32:36**
Exactly. That's just what I...

**lance.fallon@llsa.com | 32:48**
If that was one of the thoughts because the order hasn't been created in ST yet.
So things like participating order... Some of those required fields for those events don't yet exist.
Baby jumping to...

**Antônio Falcão Jr | 33:26**
Yeah, I have to reveal the tickets from the phase two. I don't have all of them on top of my mind, but if I'm mistaken, we have steps to accommodate that. Let me two.

**Wesley Donaldson | 33:47**
Jeff, you've been a little quiet. Any concerns on your side from your ticket?

**Jivko Ivanov | 33:55**
I actually just hold that. I've been taking some notes. I've been to Claude as well. This answered all my questions, thank you very much.

**Wesley Donaldson | 34:06**
I guess I'm going to just ask and pose it and like, "Do we feel there is a gap here from architecture? Do we feel there's something that is critically misunderstood or something that needs to go back to architecture?"
I would challenge us to before saying yes, answer the question of "Can the current approach, which we assume factored this in, support the idea that you have Lance about the challenge that we're going to have downstream of the right moment for hydration?"
Then how do we properly map back to a Shoplefly object, which is really an order object that the system understands downstream?

**lance.fallon@llsa.com | 34:52**
Yeah, I mean, where to hydrate. I apologize, I don't want to get too caught up in that one. To your second point, though, I guess my only point of where I'm still lacking clarity is the way that I foresaw this happening was we would get the web put in and added to a raw stream. Something would pick that up at that point.
We don't have an order, we don't have a participant because we haven't created that yet. All we've done is made a payment inside of... Currently, we still have to submit this thing in the... So I, in my head, was thinking, "Whatever picks up this raw event stream of these Webs, it'll see something like "invoice paid."
The first thing that it would do is build up that shop ID and send it to an event grid to make that order to make that participant. Then it's going to come back through the polling service and naturally create those Thrive events."
I know that the future state we're not going to have since Star. So I'm sure some of the discussion is around trying to make this future-proof.

**Wesley Donaldson | 36:29**
No, it's not. The direction from... Is like we have a target for getting something into production by the end of March.

**lance.fallon@llsa.com | 36:33**
Two.
Okay, then. Yeah, then I have a lack of clarity then, or maybe some pushback on what I'm hearing, because I would think that whatever picks up that raw event, its first responsibility would have to be...
I have to make a shop ID and send it to the event grid to make this order.
I could be mistaken.

**Antônio Falcão Jr | 37:14**
But...

**Wesley Donaldson | 37:24**
Okay, I think we need time, a bit of time to distill and just think through it. Antonio, do you think you have a clear understanding of some of the concerns that Lance is raising?

**Antônio Falcão Jr | 37:43**
Doub moed. Yeah, I do have... Otherwise, I can't just... Hand to clarify. But the... We... I would better formulate his...

**Wesley Donaldson | 37:53**
Yeah. So let's take the remainder of the time we have in the day to do exactly that.

**lance.fallon@llsa.com | 37:54**
His points.

**Wesley Donaldson | 37:58**
That's what I'm asking if I can ask you to just hear the challenges. Take a look at the DTO and see what the concern of hydration upfront versus when the system truly needs the information is.
Get a perspective on that and then maybe you and I connect. If you want to connect with Sam, maybe let's connect in the morning and just answer the question if we need another architecture session. Just full transparency.
We have a small amount of time. Whatever decision we make, it doesn't have to be the perfect decision. It just needs to be a decision that allows us to get to the target goal with the understanding that there is going to be a phase of this where we're strangling out CSTAR anyway.
So what is critical now versus what can be done that can be addressed when CSTAR as a system goes away? I think that would be my challenge when you guys are thinking through it. That makes sense. Okay, so let's break here and turn...

**Antônio Falcão Jr | 38:58**
Does. Yeah.

**Wesley Donaldson | 39:00**
It's a lot to chew on, but I'll put something on the calendar. I think we need to close the loop on this for Tom by tomorrow. So maybe I'll repurpose the AI session or some after-demo, but let's take the time to think through it and then maybe you guys collaborate over Slack and let's aim to get to a final perspective or if we need to go back to architecture, that's a final perspective as well.
But let's get to that final perspective by no later than midday tomorrow to give us some time to get Stace and to get Sam to be part of the conversation.

**lance.fallon@llsa.com | 39:33**
Sounds good. Thank you. Do you guys have to jump off right this second?

**Wesley Donaldson | 39:37**
No, we can. We can hold the call. Like I need to jump off in.
Like 05:10 minutes. But. You guys can hold a call.

**lance.fallon@llsa.com | 39:44**
Because I have... This does not include the Thrive piece of it at all, but just to put it in perspective to get the order into Krisp since my words are not always terrific. So the idea was the webhook, the gateway, some Lambda to handler, which again, it can get some information from a Curly's API. We add that stuff to some raw Lambda events. Some handler after that just places this would enrich that data with whatever else it needs to map it to that shop ID. Perhaps it reaches out to Curly's again. Or if it doesn't again, maybe this first Lambda begs it all.
But then it sends it to the event grid. That's how the order gets into Krisp. Now what this is missing is anything that they want to set up again to future-proof it. But in terms of just the bare bones, how do we get it in Krisp? This is what was I thought presented as ago to me, what was in my head.

**Antônio Falcão Jr | 41:29**
Okay, but I'm sorry, I don't see the difference. Besides the extra components we have, I don't see the difference in the flow. What would be the advantage of this flow over what we have now? I'm sorry, the simplicity you mean to be more pragmatic is the well...

**lance.fallon@llsa.com | 41:49**
The other one I see is creating a Thrive domain order created event. I don't see how we can... I don't see how that fits into what we're doing right now.

**Antônio Falcão Jr | 42:05**
Okay. But it's only the event. The point that... Because I don't get it, I really don't get the point because you mentioned that the way we are designed the flow we are going to... We will not have enough information to move forward.
But this one has exactly the same flow. That's the reason I'm confused.

**lance.fallon@llsa.com | 42:28**
It has enough to go into the sea. Well, assuming we have a mapping, it has enough to go into CSTAR, it doesn't have enough to create a Thrive domain event.

**Antônio Falcão Jr | 42:39**
It does. Or it doesn't? Sorry, it does not correct. Okay, and how do you have enough information on this point now?

**lance.fallon@llsa.com | 42:50**
Not this does not have enough for a Thrive domain event, it only has enough to go into Sea Story. So what I'm showing here does not have enough for a Thrive domain event.

**Antônio Falcão Jr | 43:06**
Okay, but I was... I'm sorry. I was under the impression you were showing an alternative solution for this.

**Wesley Donaldson | 43:12**
Yes.

**lance.fallon@llsa.com | 43:15**
So that we did have enough for a Thrive domain event.

**Wesley Donaldson | 43:20**
Yeah, that'.

**lance.fallon@llsa.com | 43:20**
I don't know. I don't think we have... I don't know how that's possible to have enough for a Thrive domain event before we have an order.

**Wesley Donaldson | 43:33**
Where is an or sorry I'm I'll play the new guy card. Where is an order created or when and where is an order created within C Star itself?

**lance.fallon@llsa.com | 43:41**
Right here. Yes.

**Wesley Donaldson | 43:44**
Okay, so CSTAR needs... That feels a little bit cart before the horse, right?
So CSTAR needs to have an order for us to then instantiate a Shopify order, sorry, not instantiate. CSTAR needs to have an order for us to create an event which has a properly built-out Shopify order object which can be pushed on the event store.

**lance.fallon@llsa.com | 44:14**
So that search notices this step right here will create the Shopify ID, which goes on the event grid and goes into CSTAR. Once the order is created in CSTAR, that's going to give us things like a participant ID, an order ID, and when it comes back into Thrive via the polling service, at that point we would have enough to create our Thrive domain events.

**Wesley Donaldson | 44:32**
Hey.

**lance.fallon@llsa.com | 44:49**
Till that happens, we would not...

**Antônio Falcão Jr | 44:55**
I think I am getting your point. You are... I think we have just a miscommunication. So the order placed event is not the main goal. The idea is to create this shop 5 DTO as a result, just to let the information...

**lance.fallon@llsa.com | 45:18**
Weerical system?

**Antônio Falcão Jr | 45:19**
Yeah, that's correct. Then if we need just as a matter of completion of the stream, reconsume whatever we started producing. In the end, that's okay, we can do that, but that's not the main goal. So I'm sorry if the order created event caused that confusion, but okay, we don't care about that order created event yet. The focus is to isolate, consume, and resiliently consume whatever is coming from recurring, and then use the CL to translate that into better event naming.
We can count on our existing streams to pre-hydrate them or better hydrate those events, and then they will provide us with the information to create this Shopify detail. In some point, you are correct. The flow is the same one we intend to achieve.
Okay, if the goal is still to begin to create...

**lance.fallon@llsa.com | 46:31**
That shop I DTO then I think we are on the same page.

**Antônio Falcão Jr | 46:37**
Yeah. Let me show you again. My screen. Just to get us well aligned on this part because it's really important, right?

**lance.fallon@llsa.com | 46:46**
Maybe because I was split up.

**Antônio Falcão Jr | 46:51**
Just a slack. This is the system diagram we're working on in the beginning. But assuming that these recurring processors are pretty much what we are talking about, the lambda itself and the LLaMA are writing the row event to this stream.
You can assume these three components are the LLaMA, and they are getting back retrieving data from recurring, for example, and so on. This connector is playing like the CL. It's a really short diagram here, so we're encapsulating too many components, but yeah, it's what it is.
So this connector, based on the row event coming from this stream, can count on the streams we have so far and hydrate this order event. The order event is the shop 5. Okay, it's just a language problem.
It's the shop 5. ETO and then it creates the order to the e-com API. We're going to clone this API just a matter of time to avoid any impact on the shop 5 flow. Then it's going to... When I say API, it's because if I'm taking the event bridge, we'll call this via webhook if I'm mistaken, right? Is the reason it is a web API.

**lance.fallon@llsa.com | 48:24**
It's... Yeah, is that the shop of ID? Agree is only the event grid and the API, right? It listens to events that go on. Then I...

**Antônio Falcão Jr | 48:37**
I did this one to make it a bit more clear for us to understand the flow. It's from Shopify. So Shopify, we have the order page webhook and then this LLaMA process validates and reaches and so on. Pet data from...
Well from Shopify and from Event Bridge. It is passed to the e-com API and then the car process the order. So we are intending to be able to produce this very same ordered event and put it on event bridge.
Okay, if that makes sense for you, it is what we are trying to achieve on this.

**lance.fallon@llsa.com | 49:27**
Yeah, I think that's the goal. One question that can you remain a little bit sorry, can you zoom in a little bit on the Zoho.

**Antônio Falcão Jr | 49:38**
Zoom in right here.

**lance.fallon@llsa.com | 49:41**
Yes, on the connector next to correct.

**Antônio Falcão Jr | 49:44**
Yeah, this one is missing some components, but okay.

**lance.fallon@llsa.com | 49:48**
Let's assume so there is a participant order screening screen. There's probably won't have anything in them that points as it pertains to... Well, I guess just the invoice paid.

**Antônio Falcão Jr | 50:05**
For that one, I have this table. Let me know if it makes sense for you. I was trying to track the information.

**lance.fallon@llsa.com | 50:13**
First of all, we would likely have it, but for something like a new order, I doubt we would have stuff in the screens already.

**Antônio Falcão Jr | 50:28**
How does it happen from Shopify now? If it makes sense for you, the order as an example. Right, so the order ID, the amount, and the total come from Webhook. The customer details as well, the billing, the line items, all come from Webhook's line, and it does those separated queries to retrieve data from the customer tab and any payment details.
Right? For the recurring perspective.

**lance.fallon@llsa.com | 51:10**
For recurrly, it's going to be a combination of like, what can we do? That of recurrly plus a lot of what probably hard here did maapping so like things like product IDS and stuff.

**Antônio Falcão Jr | 51:30**
Yeah, if we don't have the information, we have to figure that one out.

**lance.fallon@llsa.com | 51:34**
But yeah, we're. We're gonna need. We're gonna need some help with some sort of mapping jsound files or something to help us get it to a shop of five go.

**Wesley Donaldson | 51:51**
Yeah, I'd like to start that effort sooner rather than later because I think I'm getting the impression that's going to be another Herculean task. Not just figure out what the mapping is, but more importantly, get the data or figure out what the minimum data is necessary to go into that map.

**lance.fallon@llsa.com | 52:07**
Yeah, I don't think it's...

**Wesley Donaldson | 52:07**
What?

**lance.fallon@llsa.com | 52:08**
I don't think it's trivial, but... Yeah, I guess sooner rather than later. It's probably best.

**Wesley Donaldson | 52:17**
I don't think we lose anything by starting that effort now. It's not blocking anything that's inside of this epic.
So it's part of the next one. But I think it's probably worth us getting ahead of it now by starting our own...

**lance.fallon@llsa.com | 52:35**
I guess. Again, the only call out is as we're building that object up, I don't think there's anything within Thrive that we can use at that point. It would pretty much be a combination of what can I get out of Recury, plus what mappings do I have to use?

**Antônio Falcão Jr | 52:58**
That makes sense. I think we can put some effort now on getting the DTO and trying to figure it out. What information can we get from Recury webhooks in data retrieval? Plus what we have in the streams and understand if we can achieve the payload by combining them. What do you think?

**lance.fallon@llsa.com | 53:33**
Yeah, I started looking at this a while back as well, but I had some time so I could send you some of my findings there. So there are definitely some quirks in the Shopify hey Loo. Things like products have variants.
Male and female variant membership types at variance, and not all of those things even apply to how Recury works. So we're going to have a goofy map then.

**Antônio Falcão Jr | 54:17**
Okay. Wise. I think that the main work now is to focus on this map and just to make sure that we can get it populated based on what we have coming from those applications or if we are missing some piece in the middle.

**Wesley Donaldson | 54:35**
Four. I agree. I'll take a look at what we have inside of Epic too, and I'll probably pull that up and maybe get me how working on that. It'd be great if maybe Jeremy could join, but Jeremy has three smaller features he's knocking out.
So the best case I think is probably if Jeremy can take it, start of next week, sorry, mid of next week if Meha could take it probably start of next week. Short answer, yes. 100% agree. Let's... I'll get that ticket on a team member, probably from Monday.

**Antônio Falcão Jr | 55:15**
Okay, that makes sense.

**Wesley Donaldson | 55:18**
So it sounds like we got to a good piece here. Like, can I ask Rinor? I'm going to ask... Sorry, not Rinor, Tony. I want to ask you to summarize because if you can teach it, then you know it, right? It sounds like we're... That Rinor's concern is actually very much the same thing that we've been designing anyway, with a minor change.

**Antônio Falcão Jr | 55:38**
It is. Yeah. So basically, Rinor is concerned if we're going to have enough information to create the CTAR DTO based on the recurring process.

**Wesley Donaldson | 56:10**
And sorry, we like I'll don't need to answer that.

**Antônio Falcão Jr | 56:11**
8.

**Wesley Donaldson | 56:13**
I'll pause that conversation and say that we're not going to get there until we get this all the tickets and we get someone actually doing the investigation.
So Rinor, I'll probably... If you want to just ping me with the paths, I could find them myself inside of the code base, but if you know the paths off the top of your head, just send me the DTO definition and I'll include that.
Then we'll have to get... Okay?

**lance.fallon@llsa.com | 56:31**
No. If the plan is to create that ETF like we just talked about, then I have no concerns. What I thought we were talking about was creating a Thrive domain event before we even had an order created in CTAR.

**Antônio Falcão Jr | 56:50**
Yeah. What confused him, Wesley, was that I mentioned the order created event. The order created event actually is a result of a CTAR process. So it's the end line. He was not understanding how we would be able to create the order placed event even before it was processed by CTAR. There was confusion on that part.
What we are concerned now is what we have to guarantee now is that from both sides, our existing streams and from recurring, we have enough information to hydrate these DTOs because this DTO is the triggering to the CTAR process. That was the confusion. Does that make sense to you?

**Wesley Donaldson | 57:43**
Yes, I'm good. This all makes sense to me. I just wanted to make sure you guys both got to a good place. Sounds like we've gotten to a resolution.

**Antônio Falcão Jr | 57:51**
Yeah, sure.

**Wesley Donaldson | 57:51**
Which is what I was looking for.

**Antônio Falcão Jr | 57:53**
I still believe that lens don't like much from the. The data ingestion if I'm not a could guest so I.

**lance.fallon@llsa.com | 58:06**
We can do the web crawler however you like. That's not going to make or break anything. So I can even set it up just the way we discussed it, and if we want to populate more info, we can always pull more info in that web crawler.
That's not... I'm not super concerned about that.

**Antônio Falcão Jr | 58:37**
Yeah, I think. I think we are good here.

**Wesley Donaldson | 58:39**
Three.

**Antônio Falcão Jr | 58:43**
Well, let me know if you need anything else. I can summarize it yet absolutely for us to share with the team.

**Wesley Donaldson | 58:51**
Yes, that's exactly what...

**Antônio Falcão Jr | 58:53**
And...

**Wesley Donaldson | 58:54**
I just want to make sure that there's no uncertainty, and I think I just... Because there's so much conversation here, I want to make sure Stacey is just aware of what the final...
We're actually good. I just want to get that on a piece of digital paper somewhere.

**Antônio Falcão Jr | 59:09**
Sure, absolutely, yeah, sure, absolutely, right.

**Wesley Donaldson | 59:11**
Thank you guys so much for your time. So, Lance, you have everything you need to keep moving on your ticket. Tony, you have some clarity around how we're thinking about the second half of Epic two, what we talked about earlier today, right?
So all guys, thank you so much. Thank you for making the time for a super important conversation. Really appreciated it. Could you guys do it a little bit later?

**Antônio Falcão Jr | 59:32**
Thank lence, thank.

**lance.fallon@llsa.com | 59:33**
Wesley, guys. 2.

