# LLSA, Order Obj Ownership - Mar, 09

# Transcript
**jeremy.campeau@llsa.com | 00:35**
Hey.

**Wesley Donaldson | 00:38**
You guys, Jeff, go really need a Gemini lens on this minimum lens EFO copy.
There we go. All right, gentlemen, good afternoon. Hopefully, this could be a quick session just to set the stage for my chat this morning. Just from last week's rush to get everything out for MVP, there were a couple of things that were outstanding.
You all... This you called out just the need to have a little bit more clarity around some concerns inside of order. The three things that I captured, I know they're more nuanced, but like the idea of duplicate orders, pre and post order placement, handling of orphaned accounts within recurring.
Then we already talked about the fifteen-minute business rule. So I think maybe that's moot, but I kept it on the agenda. Let's open the floor. Does anyone have...? Let's start with the duplicate orders. Any thoughts, any concerns? What is the current implementation? What do we perceive as the gap? How do we deal with mismatches? It's an open floor.

**jeremy.campeau@llsa.com | 02:04**
So I did have that ticket open. That's what I need architecture review on what I've found so far, just in case people are unaware. It doesn't seem obvious that Recurly is shouting at you like, "Hey, we're going to handle any sort of duplicate, don't worry about it."

**Wesley Donaldson | 02:19**
It's difficult on...

**jeremy.campeau@llsa.com | 02:21**
They do have an error code on their API for duplicate transactions, but like you, all of us are saying, they might have their own duplicate, and they're dealing with other payment platforms, so it's not crystal clear what's a duplicate.

**Wesley Donaldson | 02:25**
We look forward to...

**jeremy.campeau@llsa.com | 02:36**
Then I think we would need to figure that out from them, like how far they covered duplicates. But then we need the LSA definition, so that way we can decide whether or not that is going to be sufficient enough going forward.
So depending on those things, we would need to, like the ticket said, persist orders in some manner so we know which ones are duplicates or not. Then that would mean setting up possibly a relational database just for that or something like that.
That's what you all were getting at. But that's the current state of that. I'll let you all mention anything else that I mentioned, because I know he brought it up in the other meeting.

**Yoelvis | 03:26**
Yeah, I just wanted to... I think Lens created an excellent document with all the issues about recording that we are having at the moment. I think fixing that is going to fix everything, including the duplicate orders and everything. The main issue that we are having is that we are trying to make recordly the source of truth for everything, and that's...
I think that's not going to work in the long run because recording is very good at billing, subscriptions, creating the payment method, invoices, transactions, and pricing. But our system should manage the business logic of the product, the participant, the payer, the orders, the appointments, and their retry logic.
So the idea is that we can't just... I mean, in the short term, we did with recording. But I think in the long term, we need to think about creating or systems on top of recording. That is going to take care of the order creation and everything else, and it's going to fix all the issues.
Because now when you create... Maybe we can go through the Lens document. But I think it's very... If you want to understand the current issues. But pretty much it's like we are creating some random accounts.
I mean, some accounts with some random codes. Then when we retry, we just... It's not fair. We just deactivate the account and we retry with a new payment method. So we could be creating a lot of Rinor accounts.
The point is we should not be relying on Rec for the order itself. The order is something that happens in our system. When you go to the checkout, you create an order in your system. Then we create the parent account, the share account, whatever is needed, and we control the IDs of those accounts.
So identity is something that we can control. So then when something fails, we want to retry. Okay, we can use the same order for the same session. We can go to recording, find if there is something there, and associate the new payment method or with the new token.
That's pretty much it. It's something that Lens mentioned in the last section of the summary. It mentioned as a long-term solution. I think that's the solution that we need to implement at some point because relying on Rec is just hanging around a lot.
I just see that working for MVP for a few users. But in the long term, we are going to have multiple issues with that.

**jeremy.campeau@llsa.com | 06:50**
Right now, I keep saying that we're not doing three participant lookups. So obviously, I think long term that has to be the goal, but it is not clear when that is going to be implemented.

**Yoelvis | 07:12**
It's very hard to know what's going on if you want to rely on webhooks. That happened in recording. Okay, let me figure out what happened in recording. Now I think when the usage goes to the checkout, it is when we need to create the order for that specific user.
Then we associate the account ID in recording and everything else. It's easier to find information on recording because now you have the ID in our system, the recording ID in our system.
So we can do the lookup very easily. And we have an order number for that part of that specific transaction that is happening. So, red is going to be easy. We don't need to deactivate users or anything like that. We control what's going on in our system.
So it's something fake. The user couldn't complete the transaction because they couldn't find a good e-payment method. We just say, "Okay, the order is in a failed state in your system." We know that because we are controlling that.

**Wesley Donaldson | 08:17**
Are you advocating for creating the order before the user clicks on "Complete PayPal"? Behind the scenes, we first create the order and then we do the authentication or let... Recursively do the authentication and then store all the relevant keys on that order that we've created.

**Yoelvis | 08:18**
We are not allowing recording to... To control that for us.
Yeah, I got it.

**Wesley Donaldson | 08:41**
So we possibly could have orders of failed transactions of failed with failed credit cards or orders that are not really ordered.

**Yoelvis | 08:48**
Yeah, I can send you a summary or I can present a little bit of my note, but in general, that's the idea. I think that in checkout, what should happen is this: the users start the checkout and in our system, we create an order and we know who the participants and payers are. We ensure the correct recordly account exists.
So we create the order, we know, we save the participant and payer. We create the recurring accounts, and we send the payment to recording. That way, we are not deactivating accounts, we are just creating the accounts in recording.
But we know what the ID is that those accounts are going to have in recording. Then we send the payment to recording. Something failed. Okay, we set the user. Okay, something fake with the payment method retry you 1.
If the user retries, it's going to look up the information because we control the order and it's going to look up in recording if the account exists. It's gonna just reuse it and try with the new talking and that's pretty much it.
But we control the order flow in our system using that approach.

**Wesley Donaldson | 10:08**
A couple of questions. 1, you mentioned the idea of us sending the payment method. My understanding of Rinor is all that is managed on their side. We never actually see... By CI, I mean it's not a system.

**Yoelvis | 10:18**
Yeah. We...

**Wesley Donaldson | 10:19**
We would like a code.

**Yoelvis | 10:19**
We send an...

**Wesley Donaldson | 10:21**
We got a token exactly correct.
So we get a token and then... So we get a status back from Rinor. Or we can use that token to say, "Hey, give me some identifier back from Rinor to get information about the order as well as being able to get confirmation of a credit card was actually available for authorizing again for paying against."
I guess my question here is, "All that is on Rinor, and we're just basically keeping together all the foreign keys like we have a master table. That's our order. We have all of the foreign keys pertaining to everything that's happened recurrently." We in theory would have a participant ID so if we need to create a user incognito or if we need to create another account somewhere else like intervals.
Maybe there's something in interval as well. You're proposing our order contains all of that reference information. So I guess that I like it generally. I think my next question is, "Let's bring Krisp into this."
Participant ID is a big thing. Maybe just say a little to how this would benefit the integration down the line with Krisp.

**jeremy.campeau@llsa.com | 11:25**
Yeah, I mean, that would be the integration of Krisp one.

**Wesley Donaldson | 11:29**
It would just be the participant ID for Krisp. Well, we'd have to do a lookup to see if there's an existing account. There'd be some kind of...

**jeremy.campeau@llsa.com | 11:38**
Well, it sounds like you us what you're saying is before we even submit to recurrently, we want to create an actual order. EX which and that would be the integration with C Stone.
That's kind of a significant adjustment to what I've heard about in terms of this, the architecture around this. But I think that's WHATELVIS is describing.

**Wesley Donaldson | 12:05**
My apologies, folks. I should have invited Antonio to this. Let me see if he's available to just jump in.

**jeremy.campeau@llsa.com | 12:13**
Because, I mean, at that point, we would have a participant gude we'd have an order. Gud we'd have a screening ID we would have I mean we would have everything at that point available.

**Yoelvis | 12:27**
Yeah, I think the webhooks are useful in case you modify something on record, it directly updates our database. Let's say someone changes the email or something like that. We can just update our database using the webhook, and that would make sense, but for most of the cases, especially because we don't want to... We want to deal with the retries and with duplicates and everything else. We need to do those things on the checkout level rather than relying on webhooks. To be honest, I don't know how webhooks are going to do the magic for this work.

**Wesley Donaldson | 13:11**
Yeah, I don't disagree. I think you caught it further earlier in the process. You have less problems in the bottom of the process, right? Garbage in, garbage out, right?

**Yoelvis | 13:25**
We want to make this, at a later time, I believe.

**Wesley Donaldson | 13:25**
I think what...

**Yoelvis | 13:28**
It's going to be more complicated.
So if we released this with the client approach, we could have multiple issues.

**Wesley Donaldson | 13:38**
I think my concern would be... Let me just challenge you all Stacey's direction historically has been to do it the way that recurrently does it, right? This is not exactly the same thing but keeping that direction in mind,
how would you counter his perspective that, "Hey, we should be using Recurly as a system, as truth, as an example?"

**Yoelvis | 14:02**
I already... That I had a meeting on Friday.

**Wesley Donaldson | 14:06**
Okay.

**Yoelvis | 14:07**
I kind of did it. But we can't I mean what I say here, it is not like we need to do this. Now. I want to have a conversation in Architectural Review with Stas.
And. But we are really aligned on Friday, and I think we are on the same page mostly.

**Wesley Donaldson | 14:23**
Nice.

**Yoelvis | 14:25**
And because we understand the need to have our system to handle the business logic, we cannot. I mean, we could think that recoi could do it.
But if you start, like, going down into the. Into the row hold, you will know that the recu is foring. It's not for business. Logic.

**Wesley Donaldson | 14:47**
Yes. So I think the instinct of letting's bring it to architecture is the correct one here. I think we need to just... I could take a pass at this. I'd love to try out the technique that Harry mentioned in the workshop yesterday on Friday.
So I'm happy to take a pass at throwing a diagram together to be able to articulate this but you're all... I would hand it to you and Lance. Lance is the creator of the document to walk through what the core concern is.
I think it's obvious. I cannot imagine that we need more visualization around the idea of "We should own our own order," but the idea that moving the process up significantly sooner in implementation is new. Stacey's buying is great, but I think we need to get Antonio and Sam to be bought in and see how that changes the architecture.
If you could have a talk track with us and just say, "How does doing it now solve trying to Insta-integrate CSTAR in three weeks?" This is how it solves that. I think that would be very helpful.

**Yoelvis | 15:52**
Yeah, sure.

**Wesley Donaldson | 15:54**
Okay.
I think maybe we've covered it all. So the concern of duplication, this would solve for that. Because we create an order, we're creating an order even before the order is real. So we're creating a temporary order or a prospective order. We'll use that to do the duplication. We can look up email or whatever else we choose, whatever logic we add there.
So that's the duplication concern you already raised. Mentioned the issue of recurly has an approach, but this would move it out of Curly's ownership. Orphan orders is the same thing. I'm just summarizing here.
Kind of... Orphan orders is the same thing because we can use our order information to go into recurrly and say, "Hey, do you have for this particular person, do you have for this visitor who's actually different from the payer?" The 15-minute business rule, I think, is moot. We already have ticket and clarity on that, so we could ignore that.
I think we covered all the agenda items. I would just like to use the next 05:10 minutes. Are there other things from last week and the week before that we are concerned about? We want to just call them out now.
So we can start tracking them.

**Yoelvis | 17:05**
No, I still know. I don't know if you have any other questions, but for me, it's like, "Are we clear about the webhooks? How to approach the webhooks, what we want to do with the webhooks in general?"
Because I think, for example, it would make sense in some cases when you go to recording and you allow the admins to make changes to the accounts or something and record it directly in those cases. What's the approach? Are we going to use the webhook for that? That's what we have to discuss in the architecture review how to make the synchronization between our order and something that happened in the recording.

**Wesley Donaldson | 17:52**
Okay. So help me with that. What are the possible events?

**Speaker 5 | 17:56**
Don't we always pull the data before we do the order or something?

**Yoelvis | 18:00**
Yeah.

**Speaker 5 | 18:02**
So that's how we make this synchronization. Why would we want to add the webhooks?

**Yoelvis | 18:07**
No, but what I mean is, how do you know what to update in the database?

**Wesley Donaldson | 18:15**
Isn't the real question, what are the events or what are the things that someone could do in real life? For example, I cancel my membership, and I do that without going to our website. What are the events that could happen directly in recurring? Or can a user trigger within recurring? You currently are the only place where that event would be fired.
That's really your question, and how do we handle them?

**Yoelvis | 18:37**
Yeah, no, I think if we handle this in the way I mentioned here, that Lens suggested is that we can just have our database, and Recoil is going to use predictable IDs. So those IDs in Recoil, you go to a Recoil, and you may find an account. That account ID is not
random as it is now. It's going to be an ID that we know. What's the order associated with that ID? So that way, in the webhook war, we can identify that order in a database and update it properly.

**Wesley Donaldson | 19:15**
He.

**Yoelvis | 19:15**
But if we just use random IDs, I don't see a connection when we can't just do that.

**Wesley Donaldson | 19:24**
I think the core of your problem is what's the system of record right now? It looks like we're going to recurring, and then we're just getting events that we're trying to hydrate our own account based on what's in recurring.
That's what's currently looks like. The plan was your proposal is... No. L.A. is the system of record, and then we're just communicating with systems.

**Yoelvis | 19:44**
Yeah, because there might be a lot of duplicates, a lot of things like that. If we want to let duplicates go through... Yeah, that's one thing, but otherwise we want users' identity to be a thing. We need to control the aperture.

**Wesley Donaldson | 20:00**
Okay, yeah, I think I'm good. I think I hear what the need is. I mean, I guess I'd ask if you have bandwidth. I'd love for you to do some simple diagramming to be able to articulate it in the conversation in architecture.
If you don't have that bandwidth, as I said, I'd love to use an excuse to try out creating mermaid diagrams and editing them though, the way that Harry mentioned on Friday, so I guess I'll leave it to you. Do you have the bandwidth?
If not, I'll do it. I can just pull together something. I'll send it over to you to get confirmation.

**Yoelvis | 20:31**
No, of course, I would be happy to create the diagram.

**Wesley Donaldson | 20:36**
I could not in.

**Yoelvis | 20:36**
I have something I've read here. But I need to prettify it. What's the suggestion? That the tool that you mentioned...

**Wesley Donaldson | 20:44**
So the workflow I usually use for doing diagramming is I would just do a ChatGPT session that articulates what the specific events and how they interact. So I get ChatGPT to do that. I usually do an ask diagram.
Before I was doing ask, I was pushing it into having ChatGPT push out a mermaid diagram. And a mermaid diagram is like a Miro diagram. The only challenge that my workflow had was it was hard to edit it after the fact.
So Harry had suggested last week of doing that Vim Mermaids editor on their main site, so I was going to just do that.

**Yoelvis | 21:08**
Yeah.

**Wesley Donaldson | 21:13**
So for you, I'd say just take the diagram you have. Have Claude bill you and ask you for... Or have Claude build you a mermaid diagram and just edit it using Mermaid's direct website or Jira... My hand.

**Yoelvis | 21:26**
What's the diagram that you shared today? Anthony was so nice to see... Was that an eraser or something else?

**Speaker 6 | 21:40**
Which one? You mean the it was.

**Wesley Donaldson | 21:41**
Good morning.

**Speaker 6 | 21:43**
It was pretty much an AML that I asked Claude to hand it to us.

**Yoelvis | 21:49**
Visualize the f. Yeah, it was looking amazing.
And you did a great job there.

**Wesley Donaldson | 21:55**
Can you actually while we have you, can you please share that? And I apologize if I missed it, but can you please share that in channel? I want to use it to kind of do some analysis for architecture, but sometimes I may be wrong.

**Speaker 6 | 22:02**
Absolutely. Yeah. Claude at the same time to create a mermaid file or AML file. Sometimes I ask for an ML because it's more visual.

**Wesley Donaldson | 22:15**
I mean, clearly, you obviously love it.

**Yoelvis | 22:15**
Yeah, it was very nice.

**Wesley Donaldson | 22:20**
Okay, sorry, let me just summarize for us. So someone needs to... If you've already read Lance's document, I would encourage everyone to read Lance's document inside the chat that just articulates some of the concerns and perspectives he has from the checkout flow placing order flow you that off they stuck with discovery so...

**jeremy.campeau@llsa.com | 22:40**
It just didn't... Why either? Yeah, I was just touching on it. Basically, the stuff we're discussing are high-level points at the bottom of the document in terms of a long-term solution, so you may need to skim down. Much of the document was centered around how we just handle parent-child relationships, but we're diving into the deeper picture anyway.
That's what spurs her down towards the bottom.

**Wesley Donaldson | 23:10**
Nice so Antonio... So you don't get blinds.
When we bring this to architecture, the conversation we had before, just to summarize, you and us lands jointly had the perspective of... Let's say create our own order that represents the transaction that the user has gone through.
Then we can pass that to recurrently, pass that to cognito, pass that to iterable. All of the downstream systems effectively work off the keys that we've established. So L.A. owns the order, and it's communicating over known identifiers. Hydrating known statuses back on our order versus using Recurly as a system of record for the order. Is that about...

**Yoelvis | 23:55**
Yeah. Yeah, that's right. That sounds.

**Speaker 6 | 23:58**
A good idea. Yeah, okay, makes sense.

**Wesley Donaldson | 24:02**
Cool. So you're going to take a pass at diagramming it out inside of the Miro space? Let me just send that to you. If you don't have it, you can just throw it in this general area chat.
When we go into architecture tomorrow, we'll discuss... Emmett, we'll discuss... And we'll discuss this as well.

**Yoelvis | 24:24**
Firefox.

**Wesley Donaldson | 24:25**
It would be probably worth YouTube connecting for. You can use the next five minutes here.
Just how does the Emmett pattern that you've described, Antonio? How does that work with what your Elli and Lance is proposing?

**Speaker 6 | 24:42**
Yeah, I'm thinking quietly... Okay, we can connect now and discuss that.

**Wesley Donaldson | 24:47**
You don't have to do it now. Maybe grab a couple of minutes, but please, before architecture tomorrow, please have that conversation. Just... Antonio, we don't want to have to rework anything. I'm trying to make sure we start this epic this week, and this is a pretty big decision that we need to make out. I don't want to have to be pushed into next week.

**Yoelvis | 25:07**
Okay, makes sense.

**Wesley Donaldson | 25:09**
All right. Everyone gets back. Four minutes and some change then. Thank you guys so much.

**Yoelvis | 25:16**
Thank you. Have a good one.

