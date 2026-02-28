# Product X AppDev Office Hours - Feb, 25

# Transcript
**Jennifer | 00:43**
Do we have anything to show Spar demo today?

**Wesley Donaldson | 00:44**
Many.

**Speaker 3 | 00:51**
Not from our sides.

**Wesley Donaldson | 00:58**
Do you mean tomorrow? Sorry.

**Jennifer | 01:01**
No, sorry. Just like sometimes we demo things this morning, like during this meeting to get it out.

**Wesley Donaldson | 01:05**
I see your product. Yep, not on our side.

**Jennifer | 01:12**
Okay.

**Wesley Donaldson | 01:14**
I think I would all of a sudd like to see if we can show for tomorrow's meaning kind of where we are. I know you're taking on a lot. 
I know that you're projecting to have a good. A good bite by end of day today. So maybe we can share where we are tomorrow in this meeting.

**Speaker 3 | 01:33**
I can't share what a half have if you want, so I have no problem. It's not one hundred percent, but maybe it's good enough.

**Jennifer | 01:45**
Yeah. Just to show. Like if it's really quick. Just to keep everybody. So we all know where things are at.

**Speaker 3 | 02:01**
So this is the checkout page. And now we are doing validations and everything else. So if you go here and you hit complete vershes, you will see the validations. Other thing I noticed is like the payment component or you UX we created here was using expiration date like combined month and year. 
But recordly is not supporting that. They only support two different components. Is one is like you want you can have everything in one car element car number, month, year, and CBB or we can have like four different elements that we can use. This is the library I'm using is like it's a React wrapper for the cooling. 
So it's providing a components and everything we need and some hooks that are very useful. So basically I had to split the month and the year. But this is validating and everything. If I put 15, for example, is valid, this is incorrect. I can go twelve year in 25. 
Because this is in the past. Okay, mind, 1227. Okay, now it's valid. Maybe I need to now I see this, maybe I need to improve this error message because it should say something like not expiration day is required. This is more like generic, but this should put something coming from recording here. The CSB, the car number you can provide the card number. I did some CSS tricks to match the recollier styles to or SSN styles because as you can see, everything here is a iPhone, everything is an iPhone, so it's very secure. We don't have access to this information. Never. We can only get the token that Recorder is creating when you hit submit, and with that token we can send that to recording. 
And recording is taking care of the rest. The recent information is this one. So now if you type the name or something like that, it's going to remove the error as soon as you put something here. And then yeah, it's working. Basically if you remove this checkbox if you put this checkbox uhh, everything here is required as well. When you hit complete pushes and type of word, we are doing the validations. 
If the person is too young, we cannot schedule an appointment for them. I think it's in the 2020 port. For example, you should you must be 25 or older. Things like that. The biological sex, termal conditions. 
And once everything is ready, we should be able to complete the push. And I am working on this last part complete pushchase to make sure it works. That's pretty much it. Any questions? Feedbacks?

**Wesley Donaldson | 06:09**
Do you know if ricurly is taking like 411 as a card? Like is it actually doing an off or just doing basic check sum?

**Speaker 3 | 06:21**
What do you mean by 411?

**Wesley Donaldson | 06:24**
Sorry, Visa uses 411 as the default card. You can usually get past the basic check sum for a credit card if you use 4 and like 15 ones. Each credit card has their own version of that. 
That is that pass check some but won't actually authenticate. My question was more is this is in the sandbox environment? Is it doing just checks so we can use like a generic card? Or is it actually going to try to do a validation against the card? An off against the card?

**Speaker 3 | 06:53**
I think it's doing some sort of validation. As you can see here, this is red. It's because it's invalid and.

**Wesley Donaldson | 06:59**
Yeah. That's just a basic check sum, though.

**Speaker 4 | 07:01**
Pretty clearly let's you use the 411111 value.

**Wesley Donaldson | 07:04**
Okay.

**Speaker 4 | 07:06**
I think they have a few others for different types of cards, but I remember seeing that one.

**Jennifer | 07:11**
It's typically by payment processor rather than by type because WORLDPAY has some weird ones that I've seen, but I'm sure we can get a list from Rick Curly for test members. I'll try to find that.

**Wesley Donaldson | 07:24**
Yeah, I think the bigger question is making sure that is it live, like, actually running against the card, or is it just mock like it's just doing test?

**Jennifer | 07:35**
It's a sandbox.

**Wesley Donaldson | 07:36**
Okay, maybe. Sure.

**Speaker 3 | 07:37**
This is a sandbo bar.

**Wesley Donaldson | 07:37**
Okay.

**Speaker 3 | 07:38**
As you can see, it's doing the actual validation. Now I put a real car and not real. It's a mobile, a real number, and it's not failing, but if I put something that is. No. It's not right. 
It's gonna fail. I need to maybe create a better ARO code here. But yeah, I please provide.

**Jennifer | 08:02**
My dot or as well. And then the 424 two as well. I just shared their tests gateway with the successful numbers and then ones that will decline automatically with the different error messages that we can test depending on the credit card number that you put.

**Wesley Donaldson | 08:16**
The perfect.

**Jennifer | 08:25**
It all declined differently.

**Speaker 3 | 08:32**
Okay. Yeah, but this is. It's working. I just need to work on the validation message, I believe and the complete purchase. I implemented this one, but I and I haven't tested so I need to test this flow here. Other than that, this is working with the iPhone and we get the token. Everything else. 
If you just select this one, this should throw a few. This is something else you hit here. It's gonna scroll to the first section with errors so it's easier for the users that are using a phone when they are in the last page just to see. 
Okay, let me start here. Yeah.

**Wesley Donaldson | 09:14**
Nice. You're all this. Do you want us to create a ticket or something to allow us to kind of prove out all of the different responses or errorypes that we'll get back for the card verification?

**Speaker 3 | 09:32**
I would try to see where I can get from the core. I am getting the airs in the complete purchase, but yeah, I think I can handle that in this PR and this ticket. It's something that is like it's gonna take too much time. I can ask you for a new ticket. 
If you agree.

**Wesley Donaldson | 09:58**
Yeah, I think my worry more is like from the product side. Like, what messages are we allowed to kind of pass straight through? Do we want to just do a generic invalid card? Do we want to do a generic like what messages are? 
And I don't know if Recurly has a friendly message versus a actual message. That's really the conversation.

**Jennifer | 10:18**
I can look into some of that. They like, I just found that they do have, like, some common decline messages, and what to do in their documentation. And then we can share that with Beth to see how we want to handle that to the customer.

**Speaker 3 | 10:43**
Alright. But I guess for now I just can put like a generic one like, uhh, please provide a valid credit card and CA and we can figure it out with problem. Or I can just share the list of the recording ones and you then let me know.

**Stace | 11:02**
Yeah. Is most of that all provided by the recurrly JS?

**Speaker 3 | 11:11**
Sorry, come again.

**Stace | 11:13**
Is most of that UI and the messages anyway provided by recurrently JS this one.

**Speaker 3 | 11:19**
Yeah. Yeah, this UI EI and this these are I frames are her cooler Si frames. So this is the cool as everything here is a yes, the com the I mean the inputs. So basically the recorder is just we say this is the input that you I want Recoli to control. A Recoli is injecting the IP into that input. 
And then when we hit submit, we just submit the information to record it directly. And they send back the Ching if this is valid and they can yeah.

**Stace | 12:01**
Do everything. Yeah, I think this is good. That's exactly what we want. I think in general around checkout order form and recurly, things like that, there's a balance, right? We have a stories with a whole lot of requirements kind of from the business, but in some ways it should be the other way around, right? 
It's more of the recurrly platform's actions should be the business requirements rather than the business trying to push a lot of stuff on recurring if that makes sense. So we do want to lead into a way recurrly platform is natively going to want to do things. 
It's going to be easier and probably better for us to adjust the business of our time.

**Jennifer | 12:44**
So just to share, like the parts that are recurrly in here are like just the input. Everything around it is of our app.

**Stace | 12:55**
Yeah, but I'm talking about response codes, messages to users, like any of that kind of stuff. Like their system's going to work how it works, right? And we don't want to end up with kind of a Frankenstein system where we're not letting it work how it wants to work.

**Jennifer | 13:13**
Yes, they everything.

**Stace | 13:14**
Elseion in the future.

**Jennifer | 13:16**
On how to handle different types of credit card declines.

**Wesley Donaldson | 13:22**
[Laughter].

**Speaker 3 | 13:23**
Yeah, I'm gonna have to implement some other verification. When I hit complete purchase, I need to. I'm gonna get the as and I can ask you as a product to see what how to deal with those. But I think I this is working very well.

**Speaker 6 | 13:50**
Is my microphone working?

**Jennifer | 13:53**
Yes.

**Speaker 6 | 13:54**
Okay. I was just going to say that a lot of the well, not a lot. There may be some business requirements that were based on assumptions of how recuurly works. So if there are scenarios where that's not true, definitely, let's talk about it. 
Because it's definitely flexible.

**Speaker 3 | 14:15**
So by tomorrow I should have like everything mostly ready, but. And even using the Paton and everything else so we can just create the invoices and see how it works and do some refinements if you want.

**Speaker 6 | 14:38**
I did rush and get two things ready. I think you guys have actually already been working on them, which are the terms and conditions in the confirmation page. If we want to run through those really quickly, just see if I missed anything, we can mark those as ready for Debor in progress if they've already gotten started. Wait, give me just a second. 
All right, we'll start with terms and conditions. It's pretty straightforward, really is just implementing the design here. The only thing that I have is the acceptance of the terms and conditions has to be stored with the invoice when it gets inserted into a Curly. I wanted to call that out because I'm doing there's a technical consideration that needs to be made on how that's being stored potentially before it gets shipped off to Recuurly.

**Stace | 15:31**
So can I ask a question on that? Now? Do we? Do we change the business rule? Are we going to let them order? Like, are we going to even charge their credit card if they didn't accept the terms?

**Speaker 6 | 15:42**
No, and that's the way that it works in CSTAR today, but I don't.

**Stace | 15:46**
Yeah, it's less than ideal, right? Because then essentially you're creating a custom field that has no option but to be true. Okay. AS and we wouldn't have an order if they didn't accept. So in other words, you're creating a custom field that cannot have a value. 
That's not true. So it's kind of necessary to store.

**Speaker 6 | 16:07**
We would just need to validate that with lawyer legal. Greg because that was the behavior that we had.

**Stace | 16:17**
Yeah, there were some complications of how we ended up there because of CSTAR and Data and all the permutations.

**Speaker 6 | 16:26**
And they needed to know which terms and conditions they accepted.

**Stace | 16:30**
Yeah, I could see that as being a valid custom field if we had a hash or something of the terms and conditions. So we knew which version that they saw. But we can tell that based on order date because we can go back in time and WORDPRESS and see what each one was. 
So got it.

**Speaker 6 | 16:49**
I can pull that out for now and just it as just like a A verify that we're covered from the legal side.

**Stace | 16:58**
Yeah, it's just one of those technical things that I have difficult time with. Like yeah, hard to do to save, but it's just kind of silly to save something that can only be one value, right?

**Speaker 6 | 17:12**
The only thing I'll say and this is probably just a shoplify bug. There are some weird scenarios where the required fields aren't being enforced, but I think that was just the plug in issue with Shopify, so it was helpful to see in those scenarios. 
But I'm assuming that's not going to be an issue here, because we're not using a third party plugin for manipulating the checkout.

**Wesley Donaldson | 17:40**
Quick question on the content in the terms of condition in the Figma. There is a reference back to the membership that has like a date and it you all this. I think it has the dollar value in there which is different than the current terms and conditions on the. On the live side. Just want to confirm. Should we just copy the message directly out of what's in the Figma? Should we use what's in production?

**Speaker 6 | 18:03**
Yes.

**Wesley Donaldson | 18:04**
And then how should we handle the idea that there is subscription specific or member plan specific information inside of the message?

**Speaker 6 | 18:17**
Go ahead and move forward with what's in the Figma. For right now, we need to do just a high level review of the terms and conditions with legal anyway. So at that point, we'll validate what's inside of there.

**Stace | 18:31**
Yeah, I think that's fine. Let's have it there for the purpose of functionality now. And I don't want to delay where we're at because of this, but I think it should go through that legal review. The other kind of sticking point is I don't think we want the content in React. 
I think we're going to want to grab it from the WORDPRESS CMS so it can be dynamic and edited outside of a release. So just don't spend a whole lot of time formatting it. Yeah.

**Wesley Donaldson | 19:00**
So just me that.

**Speaker 3 | 19:01**
For me, they the only thing that Wesley mentioned is like we are we have the ramp prices and we need to put the that second number into the terms of conditions.

**Wesley Donaldson | 19:04**
Sorry.

**Speaker 3 | 19:16**
It says membership automatically renew at that number. 
So is that something we want to pull dynamically or just, put the value?

**Stace | 19:25**
I think just let's leave this as an open item. We know we're going to have to come back at. I just have it there for display purposes now, and let's just do the legal review to see. Does the number have to be in that text? Can it reference the yeah.

**Speaker 6 | 19:40**
Yeah.

**Speaker 3 | 19:42**
And the phone number is XXXX. I don't think that's the one we won in the final.

**Speaker 6 | 19:50**
That I will get that. That should be easy for me to track down.

**Wesley Donaldson | 19:59**
Yeah, I would just summarize and say we're going to use the static content as it currently exists statically from the Figma file. And then we understand as a team that we're going to have to make it dynamic in the future. 
So the demo will contain static content for now.

**Speaker 3 | 20:10**
Yeah. 
So what's the agreement? Do we need custom field to say no?

**Speaker 6 | 20:32**
This there I think there was another space that was actually the one I need to review with Wes, so I'll pull it out of there as well. 
So the only requirement here is that it has to be checked before they can check out and that the behavior is true. So right now we're showing a shortened version of the terms and conditions. 
And then when they click read full terms, it expands into that full overlay that you see in the Figma.

**Speaker 3 | 21:19**
Is that an overlay or is just like, in line?

**Speaker 6 | 21:24**
Let me look at it really quickly. Yeah, it looks like it just expands the box. Yeah. 
Let me say this, and then I'm going to cloone it really quickly. Or the dynamic terms and conditions. 
Any other questions on terms and conditions while I am making these adjustments? 
Okay, I will mark this one as ready for dev and then you guys can talk about who can pick it up. Let's jump over to the confirmation page. So this one should be pretty straightforward as well. The Figma link is here. The only thing that I wanted to call out, and it's more of a technical question is should the information that's being displayed here be pulled back from Hercuurly to ensure accuracy? Really just deciding where that information's getting pulled from. The name and the email that's displayed here are for who the appointment is for, so this would be pulled from the visitor information, not the billing information. 
Unless it's the same, then it's always going to be the same. And then, yeah, appointment information, order summary. Obviously, we're gonna to get the order number back from MCCURLEY and the rest of this information should be correct. I don't think, I don't know that we have an email address. 
I will check our website. You guys may need the phone number and email for these two buttons.

**Wesley Donaldson | 23:53**
Is it, trying to actually do open the phone, open the call app on mobile when you click on call us, is that just going to show the number in the model? Like, how do you want call us an email to behave? Call us specifically.

**Speaker 6 | 24:09**
Let me see if we have that in the design, we might not have that interaction. No, we don't have it there. Let me pull that piece out for now. Let's just display the confirmation information and then we'll figure out. 
Because I don't have that information yet, and I don't want it to stop you guys from moving forward.

**Wesley Donaldson | 24:36**
And we're not sending an e mail as part of this. The. The actual summary. That's a question.

**Speaker 6 | 24:46**
Not as part of the scope. No, that will be post purchase processing on the back end. So we're currently should be sending an automated email for any purchases. From what I see in the configuration, the subsequent journeys that need to have an inside iterable we'll have to set those up, but not as part of this scope.

**Speaker 4 | 25:10**
For the add to Cendar. Is that only mobile or is that for all platforms?

**Speaker 6 | 25:23**
I don't think I know enough about. I've only ever clicked that button from my mobile device. I don't know if I've ever clicked that button from a destop device. You know it happened.

**Stace | 25:33**
You know there you know what that's actually something we should I'm okay if it doesn't make the demo, but there is grass Claude. It'll do this all for you, right? The add to calendar probably needs to generate an ICS file which has some nuances.

**Wesley Donaldson | 25:51**
I see. Rest him.

**Stace | 25:55**
I'm trying to think if that should really be in the in this MVP or not. I love it being there. 
And the reason I'm bringing it up, though, is if we do it there might be there's probably we have that button in the portal, but it's great out because it wasn't working properly to become one solution. It'd be great to offer it in both.

**Jennifer | 26:18**
I think the reason that we had it GRA out in the portal was because we didn't have the information in the right format at first. Now we do, and we could go back and do that, but we just didn't have the time. We only had the date before and so we graded out and then we never got back to finishing that.

**Speaker 6 | 26:42**
If you guys are comfortable leaving it here, then I would like to leave that here and we can pull out the contact information into a different piece.

**Jennifer | 26:55**
Do you guys mind leaving it there? And then just if. If it does take too long. Or if it seems too difficult, we can talk about it and take it out. 
What's my profess?

**Wesley Donaldson | 27:12**
We're doing that with the ad to add coupons. So I think that behaviors has been established.

**Stace | 27:21**
Did we add the calendar? The react there are a couple things I reacted to this for you. It appears to.

**Jennifer | 27:31**
We probably should. I don't think we used anything because we didn't have it.

**Stace | 27:36**
Yeah, I said, there's the answer is you got to create that IICS download.

**Wesley Donaldson | 27:40**
Are we okay if we call it for Strat ro?

**Speaker 6 | 27:46**
Yeah. So. On mobile? I just want to make sure I'm documenting this. It will open Calendar application Desktop will download I CS.

**Stace | 28:13**
File actually to add the Calendar react module looks pretty well supported.

**Jennifer | 28:23**
I'm sure there's like, yeah, I'm sure I've seen it's very consistent across most apps. So I don't think it's going to be something that's a right our own right.

**Stace | 28:38**
Something like this works, it'll be cake. You could add it really fast and we can do the same thing on the portal.

**Speaker 6 | 28:45**
So for the technical considerations, it's using an existing AD to calendar. Is it a plug in library?

**Stace | 28:53**
There's an M PM library. Claude gave me some code too. So I'll be developer's choice.

**Speaker 6 | 29:10**
And then let me clone this and'll add the.

**Speaker 4 | 29:17**
Got. So I think you said this earlier, but on the order summary, that order number is really just something we'll get from a Curly. That's not something that will be on our side. It's just a Curly thing.

**Jennifer | 29:33**
Correct?

**Stace | 29:34**
Okay.

**Speaker 6 | 29:35**
We may be able to configure the order numbers within Rick Curly. But it should be getting returned from RI Curly. I'm gonna call this confirmation page one dot o. Which is? Display information and add calendar. 
Okay.

**Wesley Donaldson | 30:12**
Excellent.

**Speaker 6 | 30:13**
Are there questions on the confirmation page?

**Wesley Donaldson | 30:22**
Sorry the e mail. Forgive me if I missed it, but we were going to. Fine if we have an e mail address we want to share. Same question as the calendar. Do we want to have that open an email client on mobile? Do we want to just have it be a mail to link on Desktop? How do we want to handle that?

**Speaker 6 | 30:39**
I just pulled that out into a separate, epic because I don't have answers for that yet for the contact us at the bottom. 
So let me add that here. The contact S portion is a separate scope.

**Stace | 31:02**
Beth just to note, I think we should go back to Tom maybe on this news store and ask do we want a static contact us on there at all? Or is he comfortable using the new Genesis plugin that we've been testing elsewhere because he can control the message and or turn on chats and they have full control from their side? 
So that might be interesting for us to look at.

**Speaker 6 | 31:24**
Yeah, that's a good point. So we'll just pull that out entirely. I want to talk about we have there's some messages where it says if this error persists, call us. And I want to make sure that for now, we just have the placeholder like the generic phone number in there that we were using on Shopify. 
But I want to revisit. And yeah.

**Stace | 31:43**
We weren't trying to get to plug in into Shopify, but there is something where that error can trigger, like a specific chat thing, so that message could come up there. Hey, it looks like you're having problems, so it's just an option. 
But we should talk to Tom before we.

**Speaker 6 | 31:55**
Yeah.

**Stace | 31:56**
I can't volunteer him for this, but I like the.

**Speaker 6 | 31:58**
Yeah. So we'll just pull that out entirely and figure out what how we actually want that to work and how Tom would prefer that to work and which numbers and everything should be associated. So Wes, hopefully that answers your question.

**Wesley Donaldson | 32:15**
It does. Thank you.

**Speaker 6 | 32:17**
Perfect. Anything else? 
I know we're a little bit over time. 
If questions do pop up after you guys assign those out, feel free to me. Wes, I do need some time with you before the architecture meeting. I don't know if you have time now. I don't remember what time that meeting was set. 
I think it was 02:00, right?

**Jennifer | 32:51**
I mean, an hour and a half.

**Speaker 6 | 32:53**
Okay, I'm returning the next hour west, so if you just want to message me and let me know when you're free.

**Wesley Donaldson | 32:57**
Yeah.

**Speaker 6 | 32:58**
I can walk you through the other things.

**Wesley Donaldson | 33:01**
I want to bring the engineer. I'd like to tackle with it. Just what specifically you want to go through?

**Speaker 6 | 33:05**
Sure. I wanted to talk about the. Validating the card. 
And then. We just ran out of time in this meeting. That one doesn't need architecture review, so let's focus on actually inserting the order into the recuurly.

**Wesley Donaldson | 33:24**
I think we have the folks. 
If we want to hold this meeting. It's really you, Elvis at this point.

**Jennifer | 33:29**
Okay, I'd like to join as well.

**Speaker 6 | 33:32**
Sure, then we'll just keep on moving. Give me a second and pull it up.

**Jennifer | 33:40**
We can keep it small if anybody else does need a job though. Good things done. As if it change.

**Speaker 6 | 33:49**
CH. 
All right. So we talked about the terms and conditions. So I'll go ahead and pull that out, but at a high level. And again, the caveat is we should be following most of the structure and out of the box stuff that we're currenturly has. 
So if there's anything in here that's, you know, contradictory to that, let's call it out so we can correct it. So basically when an order is submitted after the payment has been verified. So they shouldn't be getting to this page unless this piece here. 
If the payment was not able to be processed, then we're not inserting anything into recurrly. If the payment has been able to process, then we move forward. We would create an account which has all of the required information for creating an account in recurly. The payment method shouldn't be stored at the account. The charges should be visible on the account. 
And then if the visitor information is the same, then we are adding the date of birth and the gender to that account. In the event that the they're purchasing for someone else. So billing information is different than visitor information than a child account is created underneath that initial account and that is the one that gets the appointment order basically attached to it. 
So that would be the invoice if they purchased a membership. Any of the appointment information and then the date of birth and gender are added to the child account. In that second scenario, we don't need to add date of birth and gender to the parent account, so we need to make sure that information is not being required on count account creation because it may not always be necessary for creating an account. 
From there we have the invoice again, whatever Rick Curly is requiring for the invoice and automatically populating. The only caveat to that is we want to make sure we're including the appointment information on the invoice. We need it to be clear which products are associated to the appointment because when you think future state, we aren't selling the midyear package separately right now, and it's not as a product in recurly. 
But the Platinum Pack package technically does have a midyear appointment, and that one would not be scheduled at the time of purchase, so we needed to be able to see that specific line item does not have an appointment associated with it. The next piece is the membership subscription. 
So when that's purchased, the recurring subscription is created for just the recurring charges. In the event that they purchased an add on top of their membership subscription. We don't want to do recurring billing for that singular add on. It really should be just what's inside of the membership. Again, I'm pretty sure that's built in recurly functionality, but just want to validate that that's what it's doing. We are using ramp pricing for our memberships. 
And what that means is we can offer an introductory price so they can purchase at 186. And then when they go to renew, they get the second ramp price and they renew at the full price. So we need to make sure it's getting charged at the first ramp price and then later on at the renewal date, it will renew at the second ramp price. The payment information needs to be tokenized and stored within. Or Curly. 
I think we're. Curly is automatically doing some sort of association between parent and child account, so we just want to make sure that if you're viewing a child account, you can still see the payment token information and see which payment was used for the invoice, the appointment information. We just talked about that. 
And then I will remove the terms and conditions acceptance because we just chatted about that.

**Jennifer | 37:42**
Burke CHO a question on the membership piece. Sorry, where it had the ramp pricing in the acceptance criteria. Okay, so you had it in somewhere where it's like we need to make sure that it charges like the first time at the ramp price and then it charges at the other price. I feel like that's like a test that's on like Recurle's operations rather than on what we did. We should just make sure that we're setting it up with that ramp.

**Speaker 6 | 38:27**
Got it. Let me add a little bit of just context here. So. Recurrly. Membership will be set up.

**Jennifer | 38:58**
Rest. You have your hand out?

**Wesley Donaldson | 39:00**
Yeah, waiting for a good time. We spoke, I think on Monday. We wanted to get clarity on how we're like since we have the multiple memberships coming over in the recurrly get item get information feed we talked about. There's a status field that can allow us to know which one is the active one. I don't think it's a conversation for architecture. I just think we just need to maybe liter with this. This group just need to come to a decision on that.

**Speaker 6 | 39:28**
Yeah. Yeah. So I have a configuration meeting with MCURLEY this afternoon where they're gonna walk us through, like, top to bottom configuration for recurly. And that's one of the questions that we have in there is how do we determine which ones we want to actually return for sale?

**Wesley Donaldson | 39:43**
Perfect. And if you could just the ordering of it. So on the off chance that multiple come back with an active status like, should we just pick the first one in the array? The first one in the list.

**Speaker 6 | 39:55**
Yeah. YP all of that will the highest level requirement is what does Recurrly have in place so we can pick and choose which membership to show for sale?

**Wesley Donaldson | 40:04**
Perfect.

**Speaker 6 | 40:11**
All right, so acceptance criteria we talked about the person is submitting for themselves, so in that case, it's a single account getting created. Let me remove T AND c acceptance from here. The thing we didn't talk about is this error here. 
So in the event that any pieces of the order submission fail, then it should all fail. And it should be reversed if necessary. Some of the questions I had down here are more of how does recurly handle that? 
So if any part of the order placement fails, what does recuurly do? What I want to make sure isn't happening is that we're creating, like, orphaned accounts or orphan payment methods, orphan invoices in the event that any piece of that submission fails. 
So we'll need an answer there.

**Wesley Donaldson | 41:04**
You might want to add in there how it impacts the card.

**Speaker 6 | 41:05**
The other.

**Wesley Donaldson | 41:08**
So are we just doing a hold or are we going to do a void on the transaction if any part of recurrly order fails? 
Like, where did credit card validation happen?

**Speaker 6 | 41:16**
Right?

**Speaker 3 | 41:24**
Yeah, in general, I don't know what's gonna happen if they if something failed after we charge the user.

**Speaker 6 | 41:37**
You should be able to do a reversal.

**Wesley Donaldson | 41:39**
Exact.

**Speaker 6 | 41:39**
I don't know if Recover is automatically doing that. Or if you have to submit that request.

**Wesley Donaldson | 41:46**
Usually that's something we'd have to write on the back end for ourselves.

**Jennifer | 41:46**
No.

**Wesley Donaldson | 41:49**
Just do a reversal based on the. If the order didn't ship or if the order was lost.

**Jennifer | 41:57**
Are we talking about invoice creation on recurrly sales?

**Speaker 6 | 42:03**
Yes.

**Jennifer | 42:04**
Okay, this is okay, so nothing to do with like C star failures.

**Speaker 6 | 42:08**
No, this is just for Curly. If any part of the Curly order placement fails for the legacy piece, we already have the SHAREPOINT logging in place, and we'll just continue to use that to capture any errors of actually inserting into CSTAR because at that point it's too late to the end user, it looks like their order has been successful.

**Jennifer | 42:39**
Yeah.

**Wesley Donaldson | 42:39**
I think another consideration I'd love to add is how do we get this to be instrumented where we have insulated into it. Like if all this happens natively or recurrently, I'd love to be able to get that into maybe Century, maybe some other reporting. That way we can do some analysis on it down the line.

**Jennifer | 43:05**
Did we? I feel like this should be something like we need to ask recuurly today is how they handle the failures and everything more we can have any.

**Speaker 6 | 43:19**
So my suggestion would be if we can come up with a solution based on their documentation. Let's propose something to them to our integration or during our integration meeting with them tomorrow and then have them tell us if it's wrong. 
Okay.

**Wesley Donaldson | 43:36**
I like that.

**Speaker 6 | 43:39**
So that's really my goal with reviewing this is I want you guys to get comfortable with what we've got here and then put together our proposal. And then that meeting with them tomorrow should really be a validation. 
And them poking holes in our plot.

**Wesley Donaldson | 43:55**
You of us. You and I can connect. Offline. On this. But my view of this is a chunk of a piece of work that Lance was already doing this on this investigation. He can continue. He could take another spike and just get to a proposal on all of these technical considerations based on what recurrly documentation says.

**Speaker 3 | 44:14**
Yeah, I agree.

**Speaker 6 | 44:32**
Al right. Couple other things. So the relationship between parent and child account should follow the expectations that Curly has. I put some of the stuff in there that I just saw. So based on what they were testing with, I saw that the parent accounts pull the invoice in the charges but don't seem to be pulling the membership, which makes sense. 
But when you view a subscription, you can see that it belongs to the child account and the child belongs to the parent. So all of that seems already to be happening natively within early. And we should just be following what they're doing. Out of scope. 
So we should not be matching the account with a preexisting account inside of a furly. So when you go to place the order, you don't need to do a look up to see if that person already exists. We will handle that at a later point in time. 
Alright. Any other questions on what we need to do for actually placing the order into our Curly?

**Wesley Donaldson | 45:49**
And this, I'm just going to raise my hand if I'm. I'm just not my ignorance at this moment. I'm still concerned about like, the timing of all the things like the order is placed, the lock is still held against the account, held against the time slot in the screening location. We don't have a method on the existing Gateway API that says, no, seriously, I want this. Curious, the I think yesterday Jennifer, you mentioned that it's not a big deal if we do have duplicates on it. 
So it's fine, but just double confirming like there's nothing that we need to do from our systems and to like say yes, this is now solid. Because right now, there's nothing. There's nothing that's going to prevent this system from automatically clearing the locker after 15min.

**Speaker 6 | 46:40**
It drops itself after 15 minutes if you try to purchase within the 15 minutes.

**Wesley Donaldson | 46:42**
Exactly.

**Speaker 6 | 46:46**
I believe Jeremy did that investigation, but I don't recall. 
If you have to release it or not.

**Jennifer | 46:56**
You do not have to release it because it's just going to stay locked.

**Wesley Donaldson | 46:57**
Clear it out.

**Jennifer | 47:01**
Technically, you can still lock things after. Like you. Your order. Like the. The locking mechanism doesn't do any checks. It's terribly bad. 
So, like, it doesn't check to see if the order has already been placed on it doesn't check to see if anybody else has locked it. It doesn't check anything. So we understand that there are limitations on the appointment locking. 
And Stace wants us to live with those limitations until we make something new. He doesn't want us to try to fix it.

**Wesley Donaldson | 47:43**
Fully aligned to that. Let me rephrase my questions to an actual question right now. The lock will clear automatically based on some time. There's no mechanism that we have to prevent that from happening.

**Jennifer | 47:57**
Correct?

**Wesley Donaldson | 47:58**
With that said, there isn't. There is a condition where the lock will clear even though there is a real order against it, which means the system will allow another person to take another block against that location. SLA time. 
And we accept that is a known limitation and we will do nothing about it.

**Jennifer | 48:14**
Correct.

**Wesley Donaldson | 48:15**
Perfect.

**Jennifer | 48:19**
Even better than that, if two people have already opened their list of appointments and they click the same appointment, there will be two different locksmm and they could technically get the same appointment and we'll have to deal with it manually. 
So, like, there's a lot of issues with this solution.

**Wesley Donaldson | 48:35**
Six.

**Jennifer | 48:39**
Yeah, but we're just dealing with them.

**Wesley Donaldson | 48:42**
No.

**Speaker 6 | 48:44**
And that's one that I have in more of the front end piece, right? So if someone starts a session, let's time them out after, you know, fifteen minutes and have them reselect an appointment. But that's a whole different scope. 
And I skipped that because it's not necessary for critical path. It's just a like nice to have feature that we can add in to reduce downstream operational cost.

**Wesley Donaldson | 49:11**
Agree. I mean the ultimate version of this is. We need to update when the new Thrive version of that API comes online. We need a mechanism to what's the proper terminology? Not lo, but you know what I mean? 
Like accept that lock or close that lock.

**Speaker 6 | 49:27**
Yes. And the only reason that this is an issue is because our current database allows us to schedule more than one person into the same appointments slot. That and we be an appointment a different appointment.

**Wesley Donaldson | 49:39**
Maybe. Fine. If we had multiple practitioners to take in that slot.

**Speaker 6 | 49:49**
Sell guid. 
Like I can have three nine o'clock appointments, but it's guid XYZ, ABC and limit. Right? Like it shouldn't all have the same go. And right now it does.

**Wesley Donaldson | 50:00**
Yep. There's like a parent child relationship missing there. A one to many for yeah.

**Speaker 6 | 50:07**
Yeah. So it is just a flaw with our legacy system. Once we pull it out and rethink the appointment booking system, then it will be an entirely different landscape and there's a lot less hoops that we'll have to jump through. 
So for right now, we're just, you know, business as usual. We've got safeguards in place, and we've got operational teams that are handling. When these errors occur. They don't love it, but we'll get there. We'll get there where they don't have to deal with that anymore.

**Wesley Donaldson | 50:41**
Yep, I if I could just have one quick moment or just like the flowing this out, you're all the Jennifer, please chime in here. We're going to run a spike on this right now. Let's say that spike is a day's effort. Lance has already taken a stab at, like, pushing the order into recuurly, which should be generating an invoice. Should be doing some of the logic that you have identified here. 
I mean, my worry is our goal was to have this kind of be buttoned up by end of day tomorrow. The demos Friday, I think of next week.

**Speaker 6 | 51:15**
No. Okay, so for actually placing the order in recuurly, I would say we need to have it buttoned up by like, end of day Tuesday, early Wednesday, next week.

**Wesley Donaldson | 51:23**
Okay, thank you.

**Speaker 6 | 51:23**
So actually what I wanted buttoned up by Friday's demo.

**Wesley Donaldson | 51:24**
That's kind of where I'm going for. Okay, all right, that's perfect. I'll get this, like, to Lance as soon as. Give me maybe like an hour or two. I'll write it up. 
I'll have a conversation with him and I'll just summarize what we talked about here so he has that context and we'll let him loose and just like getting us back in direction. I'll ask him for, like, an initial thought by. Let's. What time is your meeting tomorrow?

**Speaker 6 | 51:52**
Do to do. Lance should be honest. Well, it's 01:00 pm.

**Wesley Donaldson | 51:57**
01:00 pm. Okay, so we'll. I'll ask him to see if you can pull together at least if not a proposal. Like a detailed list of questions and concerns by twelve o'clock so you can at least see them before.

**Speaker 6 | 52:08**
2. 
Alright, awesome. If you guys have any questions on any of the stuff we went over and let me know. I think actually I'm going to share this one really quickly because I think this one can be ready to pick up as well. When they're clicking complete purchase. This is really just that like validate the card. 
So they submit complete purchase and then we are doing the transaction against the card. And there's two error states. Obviously, if the payment is processed successfully, they're just getting ported over to. Or no, if the payment is processed successfully, then the order creation process can continue in the event that there is an error. 
That's really what needs to be looked into. Stace said this didn't need to go to architecture. It really is just looking at the recurrly documentation and figuring out what their recommendations are for handling this. 
So the payment was not able to be processed, so we tried to process it. We were able to get the request through, but for some reason the transaction itself was declined. It could be something like we don't have the right card information. The expiration date was wrong, insufficient funds, whatever messages we're getting back from recurly, that's. 
That's the first error. We should be returning just generic messages to the user, letting them know there was an issue with the payment and the order creation doesn't continue.

**Jennifer | 53:41**
Recurrently returns the customer message already. I just.

**Speaker 6 | 53:47**
Yes, nice. Okay. Let me put that in here. Early re this.

**Jennifer | 53:53**
For us for it has both an internal message for us and a customer message, so we shouldn't if that internal message isn't saved on recuurly, we should save it. But I assume it will be saved on our Curly side. 
Okay.

**Wesley Donaldson | 54:13**
Yeah, we almost needed.

**Jennifer | 54:14**
And then.

**Wesley Donaldson | 54:15**
Because we wouldn't have a mechanism to store it. Because we wouldn't have an order. At that point, we'd have to create some kind of logging.

**Jennifer | 54:22**
Yeah. Which I don't want to have to do so. Agreed. That's why I'm hoping they have it.

**Wesley Donaldson | 54:31**
I think we're good if. If I can ask for maybe stealing five minutes. Jennifer, I. I'd love to just get to three items, a bolded list of three high level items of what we're taking into architecture. 
Like most of these things we don't need to take there, like review the documentation per space. So I don't see a lot of stuff other than maybe just the post checkout process going into architecture.

**Jennifer | 54:55**
That's all I've got, so I just put it posted that that's all I have left there.

**Wesley Donaldson | 54:59**
Okay, so I.

**Jennifer | 55:02**
None of this stuff, I don't think, because all of this stuff's gonna go to recurly, like, after we kind of look into it.

**Wesley Donaldson | 55:13**
Where did you post it? Was that to me directly?

**Jennifer | 55:16**
It was in the architecture meeting.

**Wesley Donaldson | 55:17**
Architect? Yeah, you know where it belongs. Perfect. Okay. Thank you. So much.

**Speaker 3 | 55:23**
I have a okay, I have one question for the design just quickly is the I just noticed the thing here is this something that we really want the please order summary section here that is here in mobile view, but it's repeated like here the right side.

**Speaker 6 | 55:51**
I think it's supposed to replace that order summary because.

**Speaker 3 | 55:57**
Yeah, and we are trying to bring that information here as well. So I don't know how many places we want to put the order summarine into. Maybe I just kind of keep this for.

**Speaker 6 | 56:09**
When you get into checkout, the order summary information gets combined with the appointment information and dropped at the bottom of the screen. The sticky just becomes the total and complete purchase we're for. Mobile.

**Jennifer | 56:27**
For should be on the bottom.

**Speaker 6 | 56:30**
Right for Desktop complete purchase should be there and I think the order summary should be moved up. If you could just comment on that and ask Greg. I know he was moving really quickly to just try and get stuff updated, so I think you might have just put in the wrong spot. 
Alright, but that that's makes most sense to me. Otherwise you're duplicating information on the page. Okay, cool. If anything pops up, just let me know.

**Wesley Donaldson | 57:06**
Sounds good.

