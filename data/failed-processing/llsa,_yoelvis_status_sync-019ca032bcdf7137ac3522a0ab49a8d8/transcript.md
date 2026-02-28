# LLSA, Yoelvis Status Sync - Feb, 27

# Transcript
**Wesley Donaldson | 00:00**
I will take that as a yes. Afternoon.

**yoelvis.mulen@llsa.com | 00:08**
Let me see.

**Wesley Donaldson | 00:11**
I think I could do this based on what you've demoed. I think just to give you back some time. I know you've been dragged all over the place. I think my big worry is I don't want to move or close stuff out unless they truly are moved or closed out.

**yoelvis.mulen@llsa.com | 00:17**
One.

**Wesley Donaldson | 00:27**
We can just go to the board and see what's assigned. That's probably the easiest way to do this. I can share my screen.
Okay, so high-level, and then we just need your Elvis. Okay, so we moved a lot to review, so maybe we're a lot closer than we think we are. The playwright stuff again? Same thing as always. Not a blocker.
It's all good.

**yoelvis.mulen@llsa.com | 00:54**
I did the Playwright as well as part of my goal because I wanted to make sure that every time I modified something, I was not breaking and something else. So I did that. But I just wanted to see what you think if we want to keep all those tickets or we want to create one ticket to consolidate them.

**Wesley Donaldson | 01:18**
Could not they all of these go? Let's go one by one, to cover everything.

**yoelvis.mulen@llsa.com | 01:19**
What do you think? Not all... For that reason, there are some parts of the implementation that are taking parts of one ticket, but maybe not 100%.
Maybe we can go one by one. I can just tell you quickly what's done and what's...

**Wesley Donaldson | 01:43**
So this is just like a filler ticket. It's just like, "Cool. All the rules exist on the Epic. There's a lot of validation. There's a lot of implementation rules. Yeah, it's really just trying not to duplicate all the stuff that's inside here, but I think the core of this is already there.

**yoelvis.mulen@llsa.com | 01:53**
I don't know. What's business rules at this point?

**Wesley Donaldson | 02:04**
User fills out the billing.
Yeah, we got that. Billing information feels validated. Yeah, we got that, like the auto-complete not conflicting field, but I should prioritize over... I don't know what that even means.

**yoelvis.mulen@llsa.com | 02:16**
Being from out of completion, not complete with out of feel out of which people?

**Wesley Donaldson | 02:22**
Yeah, but does she mean auto from, like your Google Save profile or if you use a password manager, that like that's not something we can control.

**yoelvis.mulen@llsa.com | 02:23**
I don't know.

**Wesley Donaldson | 02:33**
That's something that gets injected us nets after entering billing.

**yoelvis.mulen@llsa.com | 02:35**
Yeah, that's the user is gonna use.

**Wesley Donaldson | 02:39**
We prove this right so we know we can move around the building. Information fields are not persisted when they return to the checkout. P that's so that's a question.

**yoelvis.mulen@llsa.com | 02:48**
Okay, that's something... I see you created a ticket for the... I recently... I think you created one ticket a few minutes ago, right?

**Wesley Donaldson | 02:56**
We have a billing no, so there's a purge ticket. Like we didn't have a like we didn't have this kind of clearly called out. Is that what you're referring to?
I think the.

**yoelvis.mulen@llsa.com | 03:08**
Yeah, that's done.

**Wesley Donaldson | 03:09**
I think what she's asking for there is... By the way, she's asking... So let's say you're here, you fill this information out, and then you jump back to this, but you jump back to packages. What happens when you go back to review and persist? Does the information persist or not?

**yoelvis.mulen@llsa.com | 03:32**
The...
Yeah, review is going to persist, but the checkout is not persistent.

**Wesley Donaldson | 03:39**
Yeah, so review persists because it's a React application, and the state still has all the data for the fields. Is that why that's why it persists? It's not because I think the worry there is we're not pushing this information inside of session storage.

**yoelvis.mulen@llsa.com | 03:53**
Yeah, that's right. I just removed the... We had something in the... I've removed all the session state for this. This is all local state. It means it's going to be gone after you move to the review page or any other page, or even if you refresh.
So all the data here is just ephemeral. It's going to be gone after this particular page is open.

**Wesley Donaldson | 04:20**
It's in the virtual DOM or it's basically just... What's the word? It's temporary. It's not persistent anywhere.

**yoelvis.mulen@llsa.com | 04:26**
Exactly. But even if you click "Review" and you go again to the checkout, that data is gone.

**Wesley Donaldson | 04:34**
Okay, "Place Order," so that's perfect.

**yoelvis.mulen@llsa.com | 04:37**
Yeah, everything you put here is gone. You need to fill out everything again.

**Wesley Donaldson | 04:39**
So then...

**yoelvis.mulen@llsa.com | 04:42**
Because if we don't want to do that, we need to save it in the local storage, and it's risky.

**Wesley Donaldson | 04:46**
So then, having just looked at the business rules, I would say this one is complete, right?
Because the core business rule is to make sure the building works. Make sure we have building fields that are filled up. The billing information has been validated. You proved that multiple times. The user can navigate between different pages. Billing goes away. The billing information field persisted when they returned to the checkout page. Or not.
Sorry, not persisted. We just talked about that. It's not...

**yoelvis.mulen@llsa.com | 05:11**
Okay. Yeah.

**Wesley Donaldson | 05:12**
We use chat... Whenever possible. We already did that, so as far as I'm concerned, this is done.

**yoelvis.mulen@llsa.com | 05:16**
I wouldn't say that it's complete, but it's in review. [Laughter] Sh.

**Wesley Donaldson | 05:21**
So what does "review" mean? Let's define what "review" means. Traditionally, "review" means there's a PR, and someone's giving you feedback. I feel like "review" in this case of this epic or this ticket means we're still... We have it inside of a site, folks are looking at it, and the product is giving feedback.
That's "review" in this context, but not on this one, got it?

**yoelvis.mulen@llsa.com | 05:41**
Yeah, that's what we have. I have a pull request open, but it's encompassing these and other...

**Wesley Donaldson | 05:49**
Okay, all right, let's not fight about finding a ticket to link it to. I think we're clear that this is part of a larger PR. Great, let's keep it going. Same thing that's part of this one page pickup.

**yoelvis.mulen@llsa.com | 06:02**
[Laughter] Yeah, I think we separated the building and the payment, but I am doing everything at once because that would make sense for me to complete the pushes.

**Wesley Donaldson | 06:14**
Yeah, again, you and I are on the same page of this. I don't think we need to check out page 1.1, check out page 1.2, click a button. But the product does things the way they feel comfortable with.
I think I've been had my hands slapped once already. Let them run the way they want to run. Okay, so the checkout page this...

**yoelvis.mulen@llsa.com | 06:35**
There are a few pieces that are missing. That's what I wanted to talk to you about to see. For those ones, we can create separate tickets or find the right tickets if we have really got them.

**Wesley Donaldson | 06:45**
Well, or do we want to do kind of like what we did here? Like the. The reason why we did this was based on the review on Monday, and it was specifically to prevent us from having to have super detailed tickets. Super minutiae. Tickets?

**yoelvis.mulen@llsa.com | 07:00**
Yeah, for me, what matters is finding a balance because we don't want to have a PU request forever
because the ticket is glowing and glowing too many features but we don't want to have every single detail into the ticket because that's going to delay the development. We need to find a sweet spot that we can say, "Okay, this is something that is manageable, that we can do in one or two days, and we can deliver it."
So what I say is, for example, now I am thinking about this. A few missing pieces in my implementation that I would rather ask you to create a separate ticket just to make sure I don't spend a ton of time on this and I can get merged.

**Wesley Donaldson | 07:46**
Good.

**yoelvis.mulen@llsa.com | 07:54**
And the other guys kind of started, like, working on the new code.

**Wesley Donaldson | 07:58**
Yeah, I agree. I just think my worry is just getting to a known state and then doing that right.

**yoelvis.mulen@llsa.com | 08:06**
Yeah. Okay, let me tell you about this one checkout page. This is very important for me, I think. Is this the one that I'm creating the PR from? Let me see.

**Wesley Donaldson | 08:14**
Now it looks like as you have two one and dr.

**yoelvis.mulen@llsa.com | 08:15**
E632. Okay, I am creating the PR for 06:32, but I don't know if that's the best ticket to create a PR for, but you can let me know.

**Wesley Donaldson | 08:27**
It doesn't matter. I actually like this one because this one was the team agreement on what was outstanding.
So I think it's a great place for you.

**yoelvis.mulen@llsa.com | 08:36**
Okay, so regarding this pay, this th this previous ticket, can you close this one? Okay, regarding this one, the terms of conditions is something that I haven't completed.

**Wesley Donaldson | 08:48**
Okay, so I can help you with that one, this one that's part of the review page. So, the button that you have to click on, is that what it is?

**yoelvis.mulen@llsa.com | 08:55**
No, it's the one in the checkout we wanted to copy page. I can... If it's a copy page from the... I can do that so you don't have to remove it, so let me know.
But I think we need to have a placeholder to make sure we review this before we release.

**Wesley Donaldson | 09:13**
One. So there are two things here, right? There's this part here that was not text. And then we said that we're just going to copy it directly from... And we're not going to worry about making a dynamic.
So that's the raw tech self.

**yoelvis.mulen@llsa.com | 09:28**
Okay?

**Wesley Donaldson | 09:29**
This was the that, this was the idea that we needed to store it inside of the freakin object inside of the database that we have.

**yoelvis.mulen@llsa.com | 09:30**
I can't do that.

**Wesley Donaldson | 09:38**
That and Stacey's counter.

**yoelvis.mulen@llsa.com | 09:39**
Yeah.

**Wesley Donaldson | 09:39**
This was why we're doing that. They're always going to be the same ball. You cannot get to checkout without getting this.
So this is actually dead per the agreement from Stacey and Beth, like after this sticker was created. So we don't need to do anything for the text.

**yoelvis.mulen@llsa.com | 09:53**
Okay, regarding the coupon, visible, but no functional. Okay, I got that one. So it's just like we need to make sure we create the ticket for the terms and conditions when... For the new approach. Or you say we don't need the approach at all, is what you say.

**Wesley Donaldson | 10:08**
We don't need that approach for this release. Like that's a future thing.
I will create a ticket for the future implementation. Actually, I'm not even going to do that because Beth will actually, as part of product responsibility, create that epic.

**yoelvis.mulen@llsa.com | 10:21**
But what I think is that it's not really what we have now. We don't have the phone number. We don't have the right copy.

**Wesley Donaldson | 10:29**
So that's on Jira code to provide that. He was like, "The agreement was just copied straight out of Figma. The fact that Figma has a slightly incorrect value, we're going to have to when we ultimately go to production with this, we'll have to have it be dynamic." That was the agreement.
So we just need to copy that. Figma is all we need to do for the demo.

**yoelvis.mulen@llsa.com | 10:51**
Okay, I'm going to copy with the placeholder phone number and everything else, alright?

**Wesley Donaldson | 10:55**
No. We were supposed to just grab the phone number off whatever's in production.

**yoelvis.mulen@llsa.com | 10:59**
Alright, that's fine.

**Wesley Donaldson | 10:59**
Now I can just grab the live phone number.

**yoelvis.mulen@llsa.com | 11:01**
Let me just put that here. Don't forget. Andenment terms and conditions using Figma plays a Figma text.
Yeah, alright that's fine, this isn't everything here. It's okay, it's in review.

**Wesley Donaldson | 11:34**
Okay, cool, so let's... We have and this is where the PR lives. Great, it's fine, we'll leave it in review.

**yoelvis.mulen@llsa.com | 11:43**
Check out page... Yeah, they saw it was done.

**Wesley Donaldson | 11:44**
[Laughter] So this is just the state. You said this is already fixed again?

**yoelvis.mulen@llsa.com | 11:52**
Yeah.

**Wesley Donaldson | 11:52**
Yeah, don't worry about this one. This is literally... So since this was already done, I'm inclined to disclose this because this is a QA ticket.

**yoelvis.mulen@llsa.com | 12:03**
Okay, sure.

**Wesley Donaldson | 12:06**
You can go away. Hold on, that prevalidation on checkout.
So this is everything that you've been working on. So maybe let's just go through the key portions. This is the one that I'm the most concerned about. This fifteen-minute bullshit, which I think has...

**yoelvis.mulen@llsa.com | 12:25**
Yeah, this is okay, go ahead for me.

**Wesley Donaldson | 12:28**
I shit, I'm not certain if this was removed from scope, okay?

**yoelvis.mulen@llsa.com | 12:36**
I am not doing that now, so I would say we can... I can do it, but I don't know how to test that.

**Wesley Donaldson | 12:39**
So I need to check on that.

**yoelvis.mulen@llsa.com | 12:49**
Let me see.

**Wesley Donaldson | 12:50**
You have to wait 15 minutes, 15-minute rule for checkout, confirm.

**yoelvis.mulen@llsa.com | 12:52**
Yeah. No. I can't just set up that for less time.
Do you think I should implement that in my ongoing PR?

**Wesley Donaldson | 13:03**
Hold on, let's just do it in real-time. Can you just ping Bethan? I'm like, "Hey, Beth, is this it? Can we not do this for demo?"
Because I'm not certain. I got to go back through my meeting notes and find if she explicitly said that we can skip that. I know we had multiple conversations, right? I just don't remember what the final decision was.

**yoelvis.mulen@llsa.com | 13:24**
Alright, and other than this, everything else is ready as I showed in the demo.

**Wesley Donaldson | 13:32**
Let's actually not let's.

**yoelvis.mulen@llsa.com | 13:34**
Yeah, but yeah, everything else is ready.

**Wesley Donaldson | 13:34**
Who wears that stupid button? Come here, come on. There we go.

**yoelvis.mulen@llsa.com | 13:41**
Everything else but the 15 minutes where I would say it is missing, and I would like to have a ticket for that one. I don't want to do it now. Probably is the order summary.

**Wesley Donaldson | 13:58**
So we have the order summary view. Where is that.

**yoelvis.mulen@llsa.com | 14:04**
Just because I am thinking that I want to reduce the same order summary from the review page. We are just creating separate summaries for every page, but I think we need to create one component that's going to take care of the summary in all the pages in the stop and we need to have the ribbon thing that we use in mobile ready as well.

**Wesley Donaldson | 14:28**
Is a sorry, hold on.

**yoelvis.mulen@llsa.com | 14:31**
But yeah, that one is for mobile. Yeah.

**Wesley Donaldson | 14:35**
No, this is... This is before you actually place the order. So it's checkout order summary. Display order summary, no checkout places it.

**yoelvis.mulen@llsa.com | 14:44**
Right now there is a mismatch between the different components. It's like in packages you will see the order summary is using one format. In review is using a separate, a different format in checkout is using a different format. For that reason, I say we can just create one component.
For that reason, I think it's worth to create a ticket for that, because we can just... I can combine everything into one component and make sure we reduce it everywhere. It would be easier to maintain.

**Wesley Donaldson | 15:21**
Okay, I hear that. Just let's just close this idea out real quick. So the ticket number 06:39 is where that confirmation page lives.
That's where... No, where the... Hold on, I apologize, let me just... That's what Jeremy is working on, where there's too many tiny little tickets. Jeremy, hydrate the page. Which means it has to be under 06:47. Confirmation page. Jesus was the literal name.
So this is the confirmation page. Inside of the confirmation page, we already have the... He already built the UI he's currently working on the calendar. He has the hydration based on the information that's coming back.
So what we're missing on this is the concern you're calling out right now. So the inconsistency between components... So here's where we should put that.

**yoelvis.mulen@llsa.com | 16:27**
Yeah, but that's not in the confirmation page.

**Wesley Donaldson | 16:27**
So are you talking about the one on the review page?

**yoelvis.mulen@llsa.com | 16:31**
It's on the checkout page. We have the order summaries on the checkout page.

**Wesley Donaldson | 16:41**
Okay.

**yoelvis.mulen@llsa.com | 16:48**
I can show you here so you can see what's the thing that I am concerned about. It is like this. You see this component or the summary.

**Wesley Donaldson | 17:01**
Yeah, first's that component, so that's here. That's already completed. Okay, alright.

**yoelvis.mulen@llsa.com | 17:11**
This order summary is using one format and missing some pieces. I think GCO is working on this that when you heat remove it's gonna display a message. Everything else in packages you can see very clearly it's different the phone size, the ball is different than here is this one one size is different.
It's not bold, it's inconsistent.

**Wesley Donaldson | 17:35**
So...

**yoelvis.mulen@llsa.com | 17:37**
Then when you get to the checkout page it's inconsistent as well. We want this page to be the same as the review. I guess that you can hit remove, but I don't want to copy paste the G implementation for this. I just want to reuse it here and check out.
So that's why I was holding this for later because I think I want to wait for GCO to get this done and I can't reduce the same component.

**Wesley Donaldson | 18:06**
Yeah, so let's maybe... I mean, your answer is the obvious answer, right? Let's actually just paint. Let's do a peer session with him, see where he is and just tell him "Hey, we want to have consistency across these components."
I think the worry that I have here is time to actually complete. This is not a knock against Jiffcode, but he's been spending you. He's had those tickets for a couple of days now. I know. We just got feedback, so I don't want to add more work to him if that means that we won't complete the demo.
If you will be ready for Monday morning, which we were at 1:00 pm Eastern time where all three of us are in Eastern... I don't think we're going to make... If we ask him to rebuild that component across to...
I think we can have the conversation. So what I'm proposing is... What are your thoughts on a refactor EPIC? This would be a high priority inside of that he'd be assigned today, but effectively he wouldn't deliver it until probably mid-next week, maybe Tuesday or Wednesday.

**yoelvis.mulen@llsa.com | 19:09**
Do you mean this portion here? I think he is already working on this. He has a ticket.

**Wesley Donaldson | 19:14**
So... The review... So... He's working on this right now. Got to check out... My proposal is... Sorry, ask a question first. What is this? Is this a duplicate component right now, clearly it's not the same? So this you created this component, what functionality are you missing from it? You're missing the... This doesn't have the remove functionality, does it?

**yoelvis.mulen@llsa.com | 19:39**
No, my point is, I want to reuse this component. I can't just do it now. I can just use whatever component Dev has created and put it here. Yeah, that's it.
That's for Desktop, for mobile. I need to do something different. It's like this adding the checkout, adding this other summary, but is this... Is this basically the same? It's a remove, everything is the same. The only difference is that this is blue.
I don't think that's a very important difference.

**Wesley Donaldson | 20:21**
Yeah, the right.

**yoelvis.mulen@llsa.com | 20:22**
I can't... My plan is to reuse the same component, and I don't want Dev to do anything else. "GCO is already working on that. I can just say..."
Okay. When GitHub is done, let me just reuse it.

**Wesley Donaldson | 20:34**
So that's my worry. I don't want to ask you to be working on the weekend, right? So Mike's committed to having this being delivered at the end of the day today so we can... He's back from picking up his son, so everything turned out fine there.
So we can just do a peer session with him right now and just say, "Hey, I'm going to reuse this component. Can you please commit the best known state of this component?" Then my worry there is colliding, right?
So if he's done all good, you can take it, but if he's not done, that's my worry. Is it faster for us to have a duplicate component just for the sake of speed to get to the demo and then refactor it down the line?

**yoelvis.mulen@llsa.com | 21:11**
When is the demo?

**Wesley Donaldson | 21:13**
So our commitment is having everything done feature-done by Monday morning. The demo itself, the actual demo, is at the end of the week. I think she said it was on Friday. That's why it's okay for us to have the complete order placed.

**yoelvis.mulen@llsa.com | 21:26**
No f for me, IWII I just want. I would say, like, we can create a ticket you can assign to me, and I can make sure it's done after Disco today Works is completed.

**Wesley Donaldson | 21:40**
As you can look...

**yoelvis.mulen@llsa.com | 21:42**
I can't do it morning or today afternoon, wherever, but I don't want to. I don't want to.
You know, to care about this right now. In my current NPR. Because I want to merge it.

**Wesley Donaldson | 21:54**
Yeah. Sorry. That was way more conversation than we needed on that. Yes, agreed, I'll create a component for that.

**yoelvis.mulen@llsa.com | 21:59**
Yeah, it's just a separate ticket and something else I want a separate ticket is about...

**Wesley Donaldson | 22:03**
Hold on there, hold up, just let me just grab a screenshot of that, please, just scroll up.
Right. You all good? Keep. Let's keep going.

**yoelvis.mulen@llsa.com | 22:16**
Yeah, and I need to add that here right to the bottom of the page. On mobile, I need to add it, and I need to make sure that this component here is what we want.
I think we can... I can just do the same. I can copy and give the code to the team, and reuse it here because it's the same thing, exactly the same thing we want here.

**Wesley Donaldson | 22:43**
Okay? This is just going to be duplicating for mobile. Come on. Duplicate existing, review component for present.

**yoelvis.mulen@llsa.com | 22:59**
I mean, I am not completely clear what we want here, but I guess I am assuming we want to copy the review behavior. I think it's the same now. I don't know if this is changing, but I just want to copy.

**Wesley Donaldson | 23:16**
AOS can in the same exactly the same component.

**yoelvis.mulen@llsa.com | 23:18**
I just copy that.
Yeah, we don't need to care about maintaining the same thing in two different pages. I copy the component.

**Wesley Donaldson | 23:25**
Just give me one second. Or... Bell.
I'll explain to you why the Wi-Fi is ringing the doorbell when she has keys. All right, so it's on JFFCO.

**yoelvis.mulen@llsa.com | 23:47**
The other thing I wanted to ask you is if you can please create a ticket for the day of birth.

**Wesley Donaldson | 23:59**
Splitting it up into different components.

**yoelvis.mulen@llsa.com | 23:59**
Because this thing is more complicated than I expected. Just to make this...
This is working with the calendar, but I wanted to make it so the user inputs the value as well, and I want to make sure this is a good implementation, and maybe that's a low priority one because this is good enough for my BP or whatever.

**Wesley Donaldson | 24:21**
So what is the what is specifically the concern you have with it?

**yoelvis.mulen@llsa.com | 24:31**
No, I just want to implement this in a way that the user can input the text in addition to this to open the calendar.

**Wesley Donaldson | 24:33**
Update the implementation. Okay, yup. User to only...

**yoelvis.mulen@llsa.com | 24:42**
But this thing here is not as simple as it looks. I can't just make it just a validation, and that's simple. I want to get something good with a good experience. Like in Chase and those banks, you can type the day, and then it's going to complete the slash and all those fancy behaviors.

**Wesley Donaldson | 25:04**
Y so I can see this.

**yoelvis.mulen@llsa.com | 25:05**
I want to get something, like, nice.

**Wesley Donaldson | 25:08**
The way that I would normally tackle this is to open a refactor epic, and then we'll move all these inside of it because we're going to go with him.
So I'll put this as part of the refactor.

**yoelvis.mulen@llsa.com | 25:15**
Yeah, but I didn't want to care about that in my current NPR because it's not as simple as I thought. I can do a simple validation, and that's going to work, but I don't like the user experience with the simple validation. It's a mess, and I hate every time I see a day component. There is no good enough.

**Wesley Donaldson | 25:38**
Okay. So I got that one. Let's keep going.

**yoelvis.mulen@llsa.com | 25:41**
Yeah. Other than that, I think the bigger issues now are packages and review. This is lacking a lot of things, but I think we have a few PRs coming from...

**Wesley Donaldson | 25:56**
Yeah, I'm not even going to have that conversation.

**yoelvis.mulen@llsa.com | 25:56**
It's taking a little longer than I expected.
But maybe it's the business logic that is difficult. I don't know.

**Wesley Donaldson | 26:05**
Let's grab him real quick and maybe it's worth just hey, let's phrase the conversation more around hey, I need to I want to use reuse this component. When will it be available or anything. I need to know about it, right? Do you want to do that? Are you clear with everything else?
Yeah. Okay, so, who was it, Jeremy? Do you guys have...? Does LSA have a browser stack account?

**yoelvis.mulen@llsa.com | 26:38**
I don't know, but I don't know why he said that, because you can just test as I show here.

**Wesley Donaldson | 26:39**
Yeah, him not being able to test locally and having to spin up Android Studios seems like a lot of work to mobile.

**yoelvis.mulen@llsa.com | 26:49**
You can test with the browser, just put the... You can select whatever phone you want here.

**Wesley Donaldson | 26:55**
I'm guessing he's trying to test the physical device.

**yoelvis.mulen@llsa.com | 26:55**
And yeah, this is Chrome.

**Wesley Donaldson | 26:58**
I'm not sure. Why? I don't... May that be a block room?

**yoelvis.mulen@llsa.com | 27:01**
If he wants to test, he can just send me the preview link and I can give you a try on... But it's not needed. We...

**Wesley Donaldson | 27:09**
Exactly.

**yoelvis.mulen@llsa.com | 27:09**
I mean, 99% of the time I don't see any developer testing on real phones. That's something else I wanted to ask you, but maybe that's a separate recommendation.
Okay, let me just hold that idea for later.

**Wesley Donaldson | 27:23**
Yeah. So three things that we have the duplication of the existing review... Sorry, the duplication of the bottom totaling component between review and checkout, and then we have the duplication or the need to reuse the component that does the order summary between review and checkout again.
Then the one that the last one we spoke about was just the date stamps. So those are the three tickets that we want to separate out the date. One is going in refactoring, the other two are going as part... I'm going to put them instead of 06:24 because they're just items that we need to fix.
So I'll get those documented and over to you in the next twenty minutes, fifteen minutes or so, and then I'm just going to start a quick chat with FF go just like, "Hey, we need to reuse that component. What are you thinking? That could be that PR could be in... Actually, let me just check what PRs have opened.

**yoelvis.mulen@llsa.com | 28:19**
Yeah, I just don't want to do a lot of micromanagement. If he told that he's going to get everything ready today...

**Wesley Donaldson | 28:28**
Then he's actually... Let me do that for you.

**yoelvis.mulen@llsa.com | 28:28**
I trust him.

**Wesley Donaldson | 28:32**
Like you should be able to you should be able to get back to actual fucking' work. Sorry. So let me have that conversation, and I'll have him just reach out to you once he has a resolution and a time for you.

**yoelvis.mulen@llsa.com | 28:45**
All right.

**Wesley Donaldson | 28:46**
Yeah, all right. Anything? So what I needed is clarity on the actual state of all these tickets. I'm now clear. The last thing I'll say sounds like you feel good about these all being closed out. The ones that are in to-do...
If I could just share my screen one more time. Let's just close those out. So this one, I'm not clear about the separation between you and Lance, and I don't think I need to be clear about that. Just making sure that this ticket is part of the holistic implementation.
I know you're already pushing in information for the demo, so this sounds like it's in progress or maybe even in review. I think my worry would be... Sorry, that won't be...

**yoelvis.mulen@llsa.com | 29:31**
The user can submit the order, but the order creates a transcript recording with the required... I got some name when the membership purchase a subscription. Maybe we can assign this to Lance.

**Wesley Donaldson | 29:44**
Okay, perfect. Thank you.

**yoelvis.mulen@llsa.com | 29:46**
But I think... Let's already work on another ticket for the backend, and it's going to be merged into my ticket. Then I'm going to merge my ticket to my PR too.

**Wesley Donaldson | 30:01**
For this one, like you know, you're already aware of this, like, did you already make this change?

**yoelvis.mulen@llsa.com | 30:02**
I just gave some feedback.

**Wesley Donaldson | 30:07**
I think the way you spoke about it sounds like you already had it. Just wasn't in the demo today.

**yoelvis.mulen@llsa.com | 30:14**
Yeah, I can do that e in that ticket.

**Wesley Donaldson | 30:17**
Can okay?

**yoelvis.mulen@llsa.com | 30:18**
I can use that ticket if you want but something else. Before I forget, we need to hear about the... What's the name of the concept there?
Okay, I forgot the name. It's not on the top of my head, but it's like you... We don't want to allow the user to create the same order twice before the... Because the usage you'll hit the button twice.

**Wesley Donaldson | 30:55**
Duplication. That's that is a great ticket to have you.

**yoelvis.mulen@llsa.com | 31:02**
I did an approach for that. I implemented a simple approach
but I don't think it's going to be battle tested. I am using the session ID that we create on local storage and using that session. I don't know if that's a good approach neither. I don't know why we have that session ID in the local source, but I'm using what we had in the local source as a session ID and after the user has a successful purchase, I am not allowing to push us again in the background.

**Wesley Donaldson | 31:39**
To hold on. We don't that we don't want that because, like, that's too isn't that too late.

**yoelvis.mulen@llsa.com | 31:44**
I importantency. I importantotency is the concept.

**Wesley Donaldson | 31:48**
The real issue is like the rapid fire, right, like click didn't happen fast enough. Click again.
Right? Usually we disable a button like some kind of UI solveware button is disabled after the initial click. And so that even if the backend takes like a minute to respond, we're not getting multiple orders sent over.

**yoelvis.mulen@llsa.com | 32:07**
Yeah, that's one thing but we should know that's not like professional implementation. I would say the implementation with the backend should handle that. The button should be smart enough to understand that we are getting the same request again from the same session and it should not continue with the purchase.
That's very standard.

**Wesley Donaldson | 32:32**
But it's a rain condition. Value of us.

**yoelvis.mulen@llsa.com | 32:34**
And the only.

**Wesley Donaldson | 32:34**
Like it?

**yoelvis.mulen@llsa.com | 32:35**
The only thing... I didn't do that. Now, I did a quick implementation just by using that session ID stuff I mentioned. But I think we need to use something like a back-end solution, using the database.
Because the Lambda I am storing everything in the Lambda, and the Lambda could be... Is AI mean in the GraphQL is using a Lambda. The Lambda could be hot or could be spinning a new Lambda. So storing the information on memory is not a good approach. We need to use something like a database or a persistent store or something like that.

**Wesley Donaldson | 33:17**
Yeah, I think the answer is it's both right. We normally... I've done this a few times, we normally disabled the UI, but you're absolutely correct. The back-end is where the final check would happen.
So I'll create the ticket for the back-end. I think because we had this exact same problem on Cstar not a month ago. Like this exact... The user clicking too fast and creating problems. The way that we had to solve it was disabling the click on the UI and having a check on the back-end.
So this is pretty consistent.

**yoelvis.mulen@llsa.com | 33:48**
Yeah.

**Wesley Donaldson | 33:50**
This is like the 20th time I'm running to this exact same problem. So do you want to create a ticket for the UI disabling or just you already have that?

**yoelvis.mulen@llsa.com | 33:59**
No, for the UI we are good. For the back-end, just for the back...

**Wesley Donaldson | 34:01**
Okay, then I'll just create this one for the back-end then.
Okay, I'm going to put that in refactoring as well. Do you...?

**yoelvis.mulen@llsa.com | 34:12**
Yeah, it's a I importantance item importantance. The requirement should be the like the pushes processing should be I important in case like the purchase is successful. The following purchase should not proceed. Consider that.

**Wesley Donaldson | 34:35**
There is a previous order for this session. Slash. Card all.

**yoelvis.mulen@llsa.com | 34:42**
Now I am thinking that I am doing that by using the SE ID that is in local stores because the same user could open a new tab and try to purchase for a different person, and that's not the same.
It's like different ones. Maybe I need to put that into the session storage as well to make it consistent with the current session storage approach. Or I can put it. Let me write that. I can put it in the session ID.
It's for my current word session ID store it into the session plus storage.

**Wesley Donaldson | 35:27**
No.

**yoelvis.mulen@llsa.com | 35:29**
Yeah, so for the same session, the user should be able to purchase successfully only once.

**Wesley Donaldson | 35:36**
Perfect.

**yoelvis.mulen@llsa.com | 35:36**
Right now, it's on memory, which is not good enough. We need to make it better.
Using a proper database or res or whatever we want to use to make that backend consistent.

**Wesley Donaldson | 35:50**
Yeah. CA we're we use memory for our caching layer. I think that's that'.

**yoelvis.mulen@llsa.com | 35:56**
No, it's like I am doing that in the GraphQL layer. Mutation. So in the API mutation, I'm just having a map in memory that is mapping session and successful or not.

**Wesley Donaldson | 36:12**
4.

**yoelvis.mulen@llsa.com | 36:14**
So that's not good because when you use a lambda, the server could be whatever they want. You could be hitting the same server. But maybe the next request is going to hit a different server.

**Wesley Donaldson | 36:27**
Is there an identifier or recurring that you could...? Is there an identifier passing to recurring that you could just check if that's in recurring rather than requiring it to use a...? Because they're a system of truth.

**yoelvis.mulen@llsa.com | 36:28**
Lambda is just throwing. Spinding out the servers.
Yeah, that's that could be a good approach, like thinking about a way to make it through recording.

**Wesley Donaldson | 36:50**
There's a system of truth, and that way you don't have to worry about your instance hitting a different Landa than my instance, so technically it's a new order in both situations.

**yoelvis.mulen@llsa.com | 37:03**
Yeah, I don't know if we can do it with recording, but probably it's complicated.

**Wesley Donaldson | 37:08**
I know what get methods they have for existing invoices.

**yoelvis.mulen@llsa.com | 37:15**
That's a complicated thing because in the future we may want the same user to complete other purchases, but with separate sessions.
So it should be session-based. No, not based on the information the user has in recording.

**Wesley Donaldson | 37:33**
Do you want to just. Do you want to table this conversation like, let's create the ticket?
But do you want to table the general conversation for an architecture meeting? Like how we want to solve for it?

**yoelvis.mulen@llsa.com | 37:42**
Yes.

**Wesley Donaldson | 37:42**
You don't have to be the only person that's solving it.

**yoelvis.mulen@llsa.com | 37:45**
Yeah. Yeah, of course.

**Wesley Donaldson | 37:46**
Yeah. Okay, so let's put this for architecture then.
Okay, alright, so we got that one. Another one on our plate. Make sure I'm not losing any of these. Cool, we already got sold for that one. Anything else you want to knock off?

**yoelvis.mulen@llsa.com | 38:08**
I think we need to run some testing. Of course, that's something we all have to do, but especially with recording and the payments and all those stuff. I want to... Before we release a production version, we need to test.

**Wesley Donaldson | 38:28**
Are you talking about hardening or are you talking about performance testing or both?

**yoelvis.mulen@llsa.com | 38:32**
No, testing for functionality and testing for the credit cards. I want to see what the errors are frequently in sending back and how we display those errors and all those scenarios.

**Wesley Donaldson | 38:47**
So I think from our conversations, I worry that the product may think we are already doing that. So I think we need to manage expectations with the product that we're...

**yoelvis.mulen@llsa.com | 38:57**
It's like with the sandbox, I don't know how to do that with the sandbox.

**Wesley Donaldson | 39:00**
That we can yeah, so that's what I'm saying, but let's just manage the expectation.

**yoelvis.mulen@llsa.com | 39:03**
That's the problem I have.

**Wesley Donaldson | 39:07**
Let's just let Bethan know.
"Hey, since we're in a sandbox environment, we're not currently getting proper authentication authorization decline hard declines versus soft declines back."

**yoelvis.mulen@llsa.com | 39:18**
I told the in the last meeting and they told the stay stays told that they wanted to create like to use the worth pay credit card pay credit cards that they have something like that.
But I don't know if we can do that with the sandbox because the sandbox is not using the actual payment. So it's like it's something we need to fill out. We need to figure out how we can test this to make the production ready.

**Wesley Donaldson | 39:47**
Well, let me take a note for that so I don't lose track of it. But then I don't think the expectation management is what we do for next week. We're probably not going to solve this for next week.
So this is a truck live hard credit card validation not implemented or tested due to sandbox, EMV, and world pay. I can ask you if you can just look at the last... Where did we have that? I think we had that in the last product app dev sync.
Look at the chat I sent the link to the test cards from world pay. We could probably just try one and see what happens.

**yoelvis.mulen@llsa.com | 40:34**
It's... It's like you can put whatever you want there.

**Wesley Donaldson | 40:37**
It doesn't matter.

**yoelvis.mulen@llsa.com | 40:38**
If the credit card is valid, it's going to go through because in the sandbox, they are not going through the actual credit card provider or whatever.

**Wesley Donaldson | 40:41**
Okay, so it's just... It's not connected at all. There is no PayPal immigration, there's no payment gateway connected.

**yoelvis.mulen@llsa.com | 40:50**
It's not connected. Yeah, it's not connected.

**Wesley Donaldson | 40:53**
Gotcha.

**yoelvis.mulen@llsa.com | 40:53**
Maybe there is a way to make the connection. I'm not sure, but right now it's not connected.

**Wesley Donaldson | 41:00**
I think...

**yoelvis.mulen@llsa.com | 41:00**
And, you know, it's it makes sense because we don't want to charge the anyone test.
It is. We just want to.

**Wesley Donaldson | 41:10**
Yeah, but the...

**yoelvis.mulen@llsa.com | 41:10**
But maybe they have a way to...

**Wesley Donaldson | 41:11**
We would do this in staging. We would connect the processor. That way we can use the test cards. That's the way we would normally do this.
I think this is just a ticket inside of the next epic regarding checkout. It's not a refactor, it's just part of the implementation, but I got it tracked.

**yoelvis.mulen@llsa.com | 41:25**
Good day.

**Wesley Donaldson | 41:32**
Let's keep going. What else you got?

**yoelvis.mulen@llsa.com | 41:35**
Yeah, just let me give AAA research. Maybe they have an approach for that. I think... I see. I am checking this webpage now and I think that they probably have some credit card numbers that are specific to fail that they are going to make it fail when we use them and something like that.

**Wesley Donaldson | 41:54**
Zero, yeah, but that's what I was saying earlier. I think that's probably literally the same thing.

**yoelvis.mulen@llsa.com | 42:02**
It's like we need to take a look and... Yeah.

**Wesley Donaldson | 42:10**
I think no.

**yoelvis.mulen@llsa.com | 42:12**
Yeah. But I didn't know that it was possible with a sandbox. That's what I want to know.

**Wesley Donaldson | 42:20**
Subscription... Note recurring only to PayPal Gateway, so you'd have to configure... Those are successes. What about the fails? Declare you go. Decline transactions.
So... It doesn't explicitly say.

**yoelvis.mulen@llsa.com | 42:40**
So I guess if we use those numbers, they are going to send the error back so we can test it.

**Wesley Donaldson | 42:46**
Yeah, I'm all about experimenting, let's just try one, right? I like to try the first one. Can I do...? I have a full cart here.

**yoelvis.mulen@llsa.com | 42:58**
No, it's like you're not going to make it because it's okay, let me share you. I can't test it was the wass the and I want to have a design review. How can we schedule those design reviews? How does, work.

**Wesley Donaldson | 43:17**
So the direction from Beth was she would take a first pass at reviewing versus design because they were designed as... Supposedly swamped, and then she would pull them in.

**yoelvis.mulen@llsa.com | 43:29**
Yeah, I want to make sure I know where to put the error from the transactional errors and details like that.

**Wesley Donaldson | 43:36**
So just message Greg. So Beth's going to be out next week. Just message Greg. We're like, "Hey, I'm sorry, I think we have too many Gregs." Greg, the product owner. Yeah, I would rather my account, my card be declined than be told I have not enough money.

**yoelvis.mulen@llsa.com | 43:45**
I know. Okay, let me just get a copy of this one. Decline, card number decline. Okay. This one, for example, it's nicer. Let me see what happened.
It's sad. So I need to do something better for testing because typing the information everything is...

**Wesley Donaldson | 44:19**
Do you use a password manager? You can just... I use one password, and it's great for stuff like this because it just pre-fills all the fields for you.
But Chrome doesn't... All your personal...

**yoelvis.mulen@llsa.com | 44:28**
I use... No, but I don't want to use my personal information.

**Wesley Donaldson | 44:32**
Fair enough.

**yoelvis.mulen@llsa.com | 44:35**
I don't want to... Man, to fill the... Yeah, that's what I'm going to do, that's what I'm going to do probably.

**Wesley Donaldson | 44:37**
But you can just create a new profile for demo and then just know you have your own personal profile.

**yoelvis.mulen@llsa.com | 44:49**
So complete purchase. Nice.

**Wesley Donaldson | 44:57**
Nice.

**yoelvis.mulen@llsa.com | 44:57**
Okay, we got a message, we just did it, we didn't need a tick or anything, so...

**Wesley Donaldson | 45:00**
So good job you're well in implementing that validation, yeah.

**yoelvis.mulen@llsa.com | 45:08**
So about the message, where can I put this message? Do you want the message to be here, to be internally here?

**Wesley Donaldson | 45:15**
So that design decision, I think I know what the best answer would be. Take the direction we currently have and let them correct us.

**yoelvis.mulen@llsa.com | 45:16**
I maybe we need to...

**Wesley Donaldson | 45:23**
So I would say go back to the previous view, just use what you what we already have, like when there's an error you.

**yoelvis.mulen@llsa.com | 45:30**
This one.

**Wesley Donaldson | 45:31**
Yeah, this guy. So let's just use this presentation.

**yoelvis.mulen@llsa.com | 45:35**
I just feel like this is not consistent. For example, here in the building info, we have the errors for the building info data. Here are the errors for the participant info.

**Wesley Donaldson | 45:47**
But the other one is a general error across the entire page, so I think that...

**yoelvis.mulen@llsa.com | 45:49**
This one, I don't know if this is general or is for the payment. I would assume this is for the payment, but why?
It's not here internally like the other sections and why it's a four issues.

**Wesley Donaldson | 46:02**
Really good point.

**yoelvis.mulen@llsa.com | 46:06**
What are the four issues? I see three here. Then, there are a lot of details that maybe design is not taken into consideration.
But I need to know how to do it. I just put this guy here. It's probably not the best one. It's hard, I think it's hard for the user to see this error.

**Wesley Donaldson | 46:26**
Well, are we jumping them back to the top of the page if that error happens?

**yoelvis.mulen@llsa.com | 46:30**
Yeah, it's going back to the... It's not going back.

**Wesley Donaldson | 46:31**
Okay. Then they'll. They'll see it. Then is I insidem agreed?

**yoelvis.mulen@llsa.com | 46:34**
Okay, that's a good point. It's not going back, it's going back if there happen here internally. But I need to make it go back. But I would put this error here inside using this approach. And that way it's gonna be easy to say okay, this is a payment stuff that is failing and scroll the user to this page and not to put anything on top because we have a section based errors.

**Wesley Donaldson | 46:57**
Do you want to add that to your note? I totally agree. I can create a ticket for you or you want to just add that to your notes from...

**yoelvis.mulen@llsa.com | 47:07**
I can do it, no problem.
This is the message that is coming from Reculy directly. I am using that exactly that because that's what Jennifer told me that they have, use a customer error. This is tailor for the customer and I don't know Beth wanted to confirm, but I think this is good for now.

**Wesley Donaldson | 47:24**
No, perfect, I agree. All right, what do you got? Okay, what else do we got?

**yoelvis.mulen@llsa.com | 47:34**
Okay, let me do that. It's not going to resemble... I'm going to put it here internally using this component. Yep, that's it.

**Wesley Donaldson | 47:48**
Okay. Right. All those are reasonable.
I see a couple of things that we need to do today into Monday, but nothing on fire. I'm still feeling very confident about this, but as a matter of... If you don't feel confident about this, it's...

**yoelvis.mulen@llsa.com | 48:05**
Yeah, it's so good. We need to make sure in the continuous integration. We set up the N2N test for this project because I added a lot of N2N tests, but those are not running in continuous integration, and there are a lot of these things I don't want to bother with.

**Wesley Donaldson | 48:17**
That's something else to add to the go-live step. Let's add that to the list.

**yoelvis.mulen@llsa.com | 48:27**
Maybe for the next week I can share other details with you that I want to add to the project. But yeah, let me just keep it for now online.

**Wesley Donaldson | 48:35**
Well, if it's pertaining to the demo, if it's relevant for the demo, I'd say let's talk about it now.

**yoelvis.mulen@llsa.com | 48:41**
No, it's not for the demo.

**Wesley Donaldson | 48:42**
It's go-live.

**yoelvis.mulen@llsa.com | 48:43**
It's like improvement for the developer experience in general. A few things that we can do differently in the code.
But, yeah, don't worry about that now.

**Wesley Donaldson | 48:54**
Yeah, and I think that I want that to be a bigger conversation. Like we should, like, think we should. The other engineers, like, what I've learned is things are usually a way they are for a reason. Let's give them a chance to say, hey, here's why it is.
And like, if we. How do we improve it? Cognizant of the past.

**yoelvis.mulen@llsa.com | 49:09**
No, everything I say is like, "I've been having conversations with the engineers. I am not just throwing ideas. I've been having a conversation with all the engineers, and I am confirming the ideas.
But yeah.

**Wesley Donaldson | 49:22**
Right? All right, let me just let's start the conversation with Jico. Hold on, that's just message me.
Do you have a task for the used my location is not working? Used my location has been working for as long as I can remember.
Could you? Yeah, I mean.

**yoelvis.mulen@llsa.com | 49:50**
What's working? Last time I... TED, let me try now to see.
I love this style. Yeah, it's working completely fine.

**Wesley Donaldson | 50:11**
What? Well, let's see what she's on. What browser slash device r you on five.

**yoelvis.mulen@llsa.com | 50:20**
I tested the website on Safari Mobile iOS because Safari is very special, especially with the new iOS versions and the... I was worried about the ribbon at the bottom. But it's looking good somehow. Safari is making the pill that they put at the bottom is not intercepting the content.

**Wesley Donaldson | 50:44**
Hold on a second.
Please do not push any changes against the test, the temp commerce store, or against recurring product... It's actively demoing. The modeing should be complete in the next approximately 40 minutes there.
Sorry, so the answer is Edge. She's saying that she's demoted on Edge one. Why? But fine. I don't have a... I can't... I don't have a... On my computer. Yeah, Microsoft.

**yoelvis.mulen@llsa.com | 51:52**
The latest... Is saying of Chrome. It's just a Chromium base, so it should be the same.

**Wesley Donaldson | 51:59**
You would expect...

**yoelvis.mulen@llsa.com | 52:00**
Yeah, I notice now the time here is like those four nice time slots.
Here we have dropped two huge ones, two columns instead of more four, for example, and there is that detail. I think there are a lot of a few details like this and other details that we can work on. I would propose to have a design review for the next week and catch all the little details and create one ticket with all the little details that we can implement quickly.

**Wesley Donaldson | 52:36**
So that's the meeting Monday morning that I need to put on the calendar. The hope is the same session that we had in the afternoon on Monday. We're going to do the exact same thing again in the morning.

**yoelvis.mulen@llsa.com | 52:46**
Yeah. I can give you a long list because I think I have a good eye for design mismatches.

**Wesley Donaldson | 52:54**
No, let me ask Devin to actually take a look at that. Like, there's like we should we have a trained QA person here. We shouldn't, just so you're aware.

**yoelvis.mulen@llsa.com | 53:10**
That's something I wanted to ask you. Can I have the QA guy reviewing my PR?

**Wesley Donaldson | 53:19**
Yeah, not for code, but for implementation. Yes, he doesn't.

**yoelvis.mulen@llsa.com | 53:21**
Yeah. No, the. The preview VRL using the preview L.

**Wesley Donaldson | 53:24**
Yeah, that's a weird one. I think I would encourage you to maybe connect with Jennifer on that. It's yes and no all at once. I asked the exact same thing maybe a month ago and the direction I received was that he should be used primarily for things that are cross-cutting, things that are infrastructure or high-level order, and not just basic feature testing.
But that being said, I've used them for critical things like this checkout flow. I've asked him to specifically look through because this is an urgent experience. To which Jennifer did not have any pushback for... But I've received pushback for using him as a traditional QA person.

**yoelvis.mulen@llsa.com | 54:06**
Who is the QA in the tin?

**Wesley Donaldson | 54:07**
There is none. Devin is the closest thing to an official QA. Your question is "Who the hell and how do what?" Who's QA? The answer is that engineers are. QA like we're supposed to be reviewing it and we're supposed to be pairing with product and product as the final acceptance, which aka is QA but your question is like, "Well, who does the accessibility testing? Who does the regression testing? Who does the actual functional test?"

**yoelvis.mulen@llsa.com | 54:31**
No, it's crazy. We need at least one QA to take care of all the tickets go to the PR.

**Wesley Donaldson | 54:35**
I agree.

**yoelvis.mulen@llsa.com | 54:38**
I see a lot of PR that are being merged without the proper reviews just because one developer approved and then it's moved to complete.
I see a lot of lacks in the process but that's something I wanted to talk with you in another session. I don't want to spend a lot of time here now, but there are a lot of things we need to think about in the process. How to make it better.
Maybe we can have a conversation with Jennifer.

**Wesley Donaldson | 55:07**
Yeah, I'd love for us to come up with our perspective on the SDLC and here's where the gaps are and here's how we're addressing them.

**yoelvis.mulen@llsa.com | 55:16**
But. Let. Let's do that the next week. Okay?

**Wesley Donaldson | 55:19**
Yeah, I get coms out.

**yoelvis.mulen@llsa.com | 55:19**
And so we can just.

**Wesley Donaldson | 55:22**
All right, so you're part of the conversation, but I'm asking Devin to explicitly look for the commerce thing, and I'm just going to say Beth reported she was not able to use my location functionality on edge. Yes, I know.
It's Chromium.

**yoelvis.mulen@llsa.com | 55:51**
The latest... Should be high. Very close to Chrome.

**Wesley Donaldson | 55:57**
Yeah, all right, and then I'll just start this conversation and I'll create... I'll start working through those tests that you asked for next with... Thank you so much, sir. Appreciate it. You're doing an awesome job. Really wanted to say that to you.

**yoelvis.mulen@llsa.com | 56:13**
Thank you.

**Wesley Donaldson | 56:14**
All right, let me get you in this conversation. I'll talk to you a little later, okay?

**yoelvis.mulen@llsa.com | 56:19**
Thank you. By.

