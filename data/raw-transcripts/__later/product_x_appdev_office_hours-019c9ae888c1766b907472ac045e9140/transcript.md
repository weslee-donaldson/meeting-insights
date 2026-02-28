# Product X AppDev Office Hours - Feb, 26

# Transcript
**Speaker 2 | 00:11**
Hello. We went over a lot in standup, so what else do we have that we need to look at today?

**Speaker 3 | 00:25**
Does it make sense for me to scale through the flow of how our initial pass at the back end works, show some examples of what is in Recruit?

**Stace | 00:37**
Yeah, that's. I'm certainly curious to see.

**Speaker 3 | 00:39**
That. 
Against ISOLVED. In flight, it's just a first pass, but the way the back end. Can you guys see my screen? Yes, the way it's set up. We are doing membership right now on the back end. Specifically. The front end does not currently have that built in, but. 
And just for the back end piece, if a plan is passed in, we're going to pull those plan details back to use it to kind of de duplicate anything else on. The purpose of that is that we don't double charge for the signature package and validation to make sure we're not double charging for anything else. On the B if you have the concept of the throwing does not equal the participant, which will create a separate parent account. This does tied to one of the questions that was posed on the GIR ticket yesterday in terms of rollback. The parent account will not be deluted automatically if the payment winds up failing. 
So that's something that we would have to deal with ourselves.

**Stace | 02:14**
Yeah, there. I would prefer to ask like this is one of the situations where I feel we need to. Our business process needs to match what the recurring platform wants to do, not the other way around.

**Speaker 3 | 02:28**
Right? Okay, yeah, week, weekends. This is what we are hoping to accomplish. Is there a better way to do it? Right now? We create it ahead of time and then when we create the actual purchase which includes a participant, we just referenced the billing as the parent account.

**Stace | 02:51**
Do we mean this won't be a problem on launch date because there's nobody in recur when you do the create account? How do we know if that already exists or is a future problem?

**Speaker 3 | 03:04**
And that's something else. We are not doing any account checking at the moment.

**Speaker 2 | 03:09**
Yeah, I have that as a feature enhancement after we get into production.

**Stace | 03:15**
Got it. Interesting question to ask, Rick. Curly. When we're ready. In case they have something that helps us with this. Or do we need to build [Laughter] that check for existing user thing?

**Speaker 3 | 03:26**
Yeah, I mean that there's an ID that we're going to get back when the account gets created. Whether we want to pass that along. And Star, I assume, would be up to us. But yeah, if it's something we can ask them. 
If the billing does equal the participants, it's just one account that gets created. So that would be atomic. The purchase, the membership, the account, the invoice, all that goes into one call. So if the payment does fail, nothing gets created in the case that the billing and the participant is the same in order to pass the appointment ID along. This is something else you can check with them. 
But we do have that custom field online items. Something that I ran into was the scenario where they get a membership and nothing else. So the membership would replace the signature package and they technically wouldn't have any line items because all they're really buying is a plan on the invoice. 
So what I've done at the moment is every order that gos in gets a zero dollar line item that's towards the appointment ID So again, that might be something that we want to verify with them. This kind of ties into a question on this document. I wasn't 100% clear on the use case here. 
But there's a mid year in platinum package for an appointment that isn't the appointment that they just purchased. So it's like a future appointment. We mentioned we might have to flag those line items as a separateointment ID or a blank appointment ID, something of this sort. This kind of depends how we set up the platinum package itself. 
If the idea is that the Platinum package has, like, diagnostics within it that they're going to redeem at some point in the future, we don't really have a way of identifying diagnostics within an item, if that makes sense. 
So like we would have the Platinum package as an item in Curly, we could have an appointment ID custom field on that item. But if there are embedded products within that item that need separate appointment IDS, I don't think that is something that is built into a current.

**Stace | 06:30**
Yeah, there's a lot we have to figure out with the platinum package going forward because there's some that orphan midyear thing, it's a problem in CSTAR. It's going to be a problem here at Migration. 
It's a problem and job, but, we will have to come back at this if we keep it this way. Okay? Yeah, we should think as a note for product here. I mean, I think we really need to think about if we're going to keep that sort of package, like what is the user experience, especially since it's a visit that's six months away and in most places, the country like scheduing at the same time isn't even an option.

**Speaker 2 | 07:24**
Yeah, I we do.

**Stace | 07:25**
So there's some experience we have to drive them back to the portal. Will they be prompted to now set up your midyear? So it's almost like it's some sort of credit in the system or something like that or I don't know, it's weird. 
So we got to figure it out.

**Speaker 2 | 07:40**
Yeah, I think we just do need a solution from Re Curly on bundling instead of using an item as a package. I know they were going to do some research on that. So for now, we're moving forward with the packages as individual items, but we need. We can't do that going forward. 
Yeah, I can. Definitely.

**Stace | 08:03**
All right, it might just be a limitation that to complete commerce, right? We wed to rethink platinum, and there will probably be some disappointed people for a couple of months, but if that's what it takes. 
That's what it takes. [Laughter].

**Speaker 3 | 08:20**
The last piece here again kind of related to membership. If they do you sign up for a plan, we are automatically adding whatever coupon is associated with a membership to the order. This is a another question for the KR. Now we set up the tons. 
Right now the way it works is we unconditionally add the KPON if they get a plan, the plan is set up. The coupon, however, is set up to only apply to certain products that it can be redeemed on, so we can add it unconditionally and then it'll either redeem or it won't be able to sit on the account if it has not been redeemed.

**Speaker 2 | 09:17**
We did talk about that with them yesterday a little bit. So the way that we'll have to set it up is basically a coupon code per each membership year so that they can't use the same coupon code more than once.

**Stace | 09:32**
Yeah, but I don't think that's in the purchase flow, right? That's got to be something else later. So that's not this code based bath, right? That would be some other code base that listens to the subscription renewed web hook and creates the coupon for that year. Not that's not the store that would do that.

**Speaker 3 | 09:54**
Yeah, because we're manually adding it to the plan when we see that they have a plan. So it'd be kind of the same flow when we see a renewed for a plan go ahead and add that coupon code to their account.

**Speaker 2 | 10:11**
I see. Okay, now I understand. So there's a difference between that they're purchasing now and that's that will always be the same coupon code. So one life year, one coupon code and then.

**Stace | 10:28**
Would they don't get another coupon code unless the renew is successful. And then we'll have to build something that listens to that. Hey. The payments has been processed for this member.

**Speaker 3 | 10:40**
And we' going. How can we.

**Stace | 10:43**
They did a new.

**Speaker 3 | 10:44**
Something. [Laughter] Carers can have a duration, right?

**Speaker 2 | 10:50**
They can, yes.

**Speaker 3 | 10:52**
Okay, so we could make the membership keep on a one year duration, which could technically be applied at any point in the next year. I guess the last caveat on the Kuon is since everything is unauthenticated at this point, it would technically just kind of sit on the account as unredeemed if it didn't apply to their purchase. 
And then my assumption was that this would have to be handled inside of C Star in the meantime to apply that pending vouchers.

**Speaker 2 | 11:42**
Right? Yeah, because we don't have this initial pushout. If they wanted to do enhancements after the fact, that would have to be through CSTAR or F SA so as long as we're creating the membership in MMA without any payment information or anything like that, the membership itself is just in there. It should generate the voucher for them to use in CSTAR or FSA yeah.

**Speaker 3 | 12:11**
And I think the way it's set up now is it'll create the voucher. It'll see what's on the order and apply the voucher if it's applicable. Or to sit on the order if it. If it hasn't been redeemed yet.

**Stace | 12:26**
Yeah, we're gonna have to remember the bath. And the potential for loss might be cheaper than the solution to it. So that'll happen. And so say for the next three months, if these orders get changed or manipulated and CSTAR and someone use the voucher, fine. 
But when we point CSTAR or when we point call Center away from C Star back to Thrive and we look at the account and recurly, the coupon's still going to be there. [Laughter] So you might have some users that have a small potential of using the coupon twice.

**Speaker 3 | 13:09**
We could you could put sort of a back in today if we want to. After we submit, check to see if the Kuon was is still active, which means it hasn't been redeemed and just take it off the account. But.

**Stace | 13:26**
Yeah, I think we would look at that and the data migration and call center migration. But it might be right if it's yeah, if it's 5 or eight points to develop something to sync those coupons, it's probably going to cost the business more than a hundred people getting an extra 30 bucks. [Laughter].

**Speaker 2 | 13:44**
Got it?

**Stace | 13:48**
Or thousand people will get an extra 30 bucks. It's probably closer. [Laughter].

**Speaker 3 | 13:56**
Right's just a few of the examples that you sent in. They're all of these are going to be the parent child type. So this is a signature package, vitamin D and the membership. So the signature package is going to get replaced because we've got a membership. They got a vitamin D which is a blood test certainer voucher will apply to it. This guy. 
So this is the parent account that has the invoice on it. So you get the run life vitamin D and then the blank appointment line item which storage with the appointment ID remember the invoice itself would just have the first year cost of the membership for the vitamin D doesn't ended discount that got appli and then on the child count and that's where the membership would be created. It does start automatically. 
It's in progress. Then renews at 1907. But that is all stuff that's configured within the core.

**Speaker 5 | 15:36**
Is there a way to validate the to get errors from recording a sandbox in case we want to validate what happened when a car is cannot be charged for whatever reason and things like that.

**Stace | 15:55**
Should be what I don't think is set up yet. Thanks, Stephen sick. Jennifer on a call I don't know if I have our world pay like sandbox credentials. I have those. But then these guys confed recurrly sandbox. 
And then you can use. There's a list somewhere of different cards you can use in the worldp sandbox to get all of the response codes. So you should be able to test with that in theory once recurly is configured to our WORLDPAY sandbox. 
Right? WORLDPAY provides a way to get back declines, expires all the different type of cards.

**Speaker 3 | 16:38**
There might be more examples there. The one that I was able to test was this forward zero two number. I could only get one sort of standard message back. It seems to be the same whether or not like your funds are low or something else because most of this validation actually happens upfront when you get the token on the client. 
It's two separate validations, but the server side validation when it comes after to make the payment is going to be different from the client side validation when it checks the card itself. So right now it's kind of just a generic. It was declining. Use.

**Wesley Donaldson | 17:23**
[Laughter].

**Speaker 3 | 17:23**
Something else could contact your gang. 
And then if the token is dead, so just died, but it'll say that your CO is exped or invalid in this same sort of format.

**Stace | 17:44**
Yeah. And unfortunately, in the fraud world, right, where as a business, we might want to be more transparent about why online, you kind of can't be like you don't want to say expired versus mark stolen versus low funds because that clues people doing bad things into how to proceed, right? This was all looking pretty good. Does your preview order endpoint help at all? 
Like when we're doing any of the calculations or for front side validation, are you just submitting the order?

**Speaker 3 | 18:22**
Say that again.

**Stace | 18:24**
They're using their preview order endpoint at all to do any of the calculations and stuff on the screen. Are you just submitting the order?

**Speaker 3 | 18:30**
I just submitting. Okay, we do have a few other examples, but they're pretty much.

**Stace | 18:41**
Back to your ide e and like their recurrly what we call it recurrly products DS or something like that.

**Speaker 3 | 19:00**
Sorry, was that is that a question?

**Stace | 19:02**
Yeah, is like where you had the, create coupon like that this guy.

**Speaker 3 | 19:11**
Yeah, what specifical lift did you want to see?

**Stace | 19:15**
So I guess I can check this out and look at it myself, too. The. The one thing I just wanted to note here. Right. I'm glad you have to dos and [Laughter] comments about what's going on because the team's going to have to come back to this. Obviously, as the product catalog changes in refines, we're going to probably be modifying this file more than we're going to like over the next couple of months. 
But one thing to think about here in these conditionals. Because the product list or the subscription list is dynamic. Yeah, think about being null safe for always having like, an OCE, right? So it knows what to do if it doesn't recognize something that's been added to the system. Does that make sense? 
And maybe you've already taken care of that. Well.

**Speaker 3 | 20:03**
The if we're talking about, like, updating, we're talking about, like, what updating, what membership includes, for instance.

**Stace | 20:12**
Yeah, because somebody's gonna have a new membership plan, right? And maybe it doesn't have the coupons, so they didn't want to fall through that if block, but no to do something else.

**Speaker 3 | 20:23**
Gota so right now it's just a generic. If you have a plan, you get a coupon code.

**Stace | 20:29**
That's probably fine for March, but just like I note, we will probably have to come back and harden.

**Speaker 3 | 20:35**
Right? Yeah. I mean, I guess. Yeah. Different plans might tie to different kuypon codes in terms of the ad ones themselves. We do a live look up each time. Okay, so if they have a plan, they get this plant ag ones and then that's what we use to ensure that we're not duplicating anything on it.

**Speaker 5 | 21:05**
Any place is this like WW when is the payment happening? Is the last step.

**Speaker 3 | 21:19**
Yeah. So again the parent account right now gets created upfro so that is the that's separate.

**Speaker 5 | 21:34**
So in case the payment fails you will I delete the account?

**Speaker 3 | 21:42**
That's the question.

**Stace | 21:43**
So yeah, let's ask re curly what they want to do.

**Speaker 5 | 21:50**
Maybe we can.

**Stace | 21:51**
How that works because there might be different business processes we build around how re Curly wants to work. They hold the account for now. There might be. I guess where I'm going is what recurrently chooses to do and what we choose to do on the web hook could be two different things. 
So if he currently wants to like hang onto it, right? It doesn't cost us anything else, then maybe just leave it there. We may choose to ingest it and to Thrive in a different way. Obviously we don't want to create like EP logins and send confirmations and that kind of stuff when the payment fails, but call or something like that. 
So let's just see what how their system wants to handle those things.

**Speaker 5 | 22:41**
We need to think about retries in case the user retry because the payment failed and they changed the call.

**Speaker 3 | 22:52**
And they make work.

**Speaker 5 | 22:54**
Are we creating a new account, a new parenting account, everything else. So we need to do some sort of. We can either delete the account if the payment fails, or we can just create t to match the account to the existing one.

**Speaker 3 | 23:09**
Yeah.

**Stace | 23:10**
Because I don't think we want to create multiple accounts that love to lean into what how their system wants to work rather than us trying to reverse engineer it.

**Wesley Donaldson | 23:20**
The other side of that same issue is just de duping. Not that. Not handling or after an error, but like if I come in and I create an account as part of a purchase and I come in and I have a minor change. Are we just keying off email? Or is there something else that we're doing?

**Stace | 23:35**
Yeah, well, I have that is through the system. Can we put constraints like you can't have two accounts with the same last name and like, say email plus phone?

**Wesley Donaldson | 23:46**
Yeah. Nice.

**Stace | 23:48**
Yeah, I think in the Thrive world and writing our identifiers, probably something like last name.

**Wesley Donaldson | 23:48**
There could be an opportunity for a household as well.

**Stace | 23:54**
Like if you combine, all these are strings. Last name plus date of birth, plus email, plus phone, right? You can have two people to say memobil. The phone needs to be different, or vice versa. But it some combination of that sort of represents, I think a person.

**Wesley Donaldson | 24:09**
There might be an opportunity down the line for like upselling for maybe just understanding how household might work here.

**Stace | 24:16**
Yeah. 
Yes. So we just have to understand that world. If we can't apply the constraint to recurly, then again, maybe it's more of our web hook problem when we understand there could be multiple instances of the same person in the recurrly database, but we've got to combine them to a single PGD in the event stream. 
But that would be messy to track over time.

**Speaker 3 | 24:52**
Yeah, the other. This probably isn't a curly question, but, we may want to decide the account code format for what we're creating. Right now it's just kind of a generic parent child dash time stamp or account dash time stamp. 
If it's not a parent sh again, some of that might tie into how we plan to track these accounts after we pre them. Sounds like MVP. We may just be submitting them and creating them with.

**Stace | 25:45**
Where that relationship at least from launch kind of needs to be right as if there's a parent child account created on a membership because that has to be linked correctly for the headless rebuilding to work, right? 
Because then recuurly is just going to act upon its own data. That makes sense sort of right? Because this is their system that's going to understand like, hey, the term just ended for this person, I'm going to go rebuild them. 
But this person actually has a parent billing account, so I'm going to rebuild against that billing profile like we don't like on nothing. No code we write will ever execute that, right? It's there's their hand on the membership rebuilding. 
So that's where we've got to be sure, at least for subscriptions, that the representation of those accounts remains in sync at recurrly because they're.

**Speaker 3 | 26:45**
Actioning on it. I mean, if the question is whether it build the right account on is new, I would assume it does. But yeah, I think I would hope it does. 
That's pretty much the current state of what it does right now.

**Speaker 2 | 27:15**
Awesome. Looks good. We have to jump over to another meeting. But if there's anything else, just jot it down and then we can jump into the meeting with Recuurlio. One.

**Wesley Donaldson | 27:29**
Really quick. Beth it's not critical for today or if we can just maybe have a sink tomorrow afternoon or so as we normally do on what else we can kind of refine enough to get the engineers working on it.

**Speaker 2 | 27:42**
Two.

**Wesley Donaldson | 27:42**
It's going to be a little light, I think. And maybe Lance as will come mid to early next week.

**Speaker 2 | 27:48**
Yeah, I think the conversation today will give us what we need for some of the missing pieces. And then we can chat about the. There's more like, tech enablement. Tech heavy stuff. That I think you guys could take a look at.

**Wesley Donaldson | 28:04**
Nice. Okay. Perfect. Thank you.

