# Product X AppDev Office Hours - Mar, 30

# Transcript
**Speaker 2 | 00:02**
Revolves around our logging functionality.

**Wesley Donaldson | 00:02**
We alter on our loggage functionality.

**Speaker 2 | 00:04**
This is just to stop bad inputs from going through into EP and then, try and garner some feedback over how we want to present UI feedback and what that UI feedback will look like in case there is any bad input. A lot of what we're seeing in logs or failures on bad inputs either email addresses that are not fully qualified. Email addresses or phone numbers that are not complete fully qualified phone numbers, meaning like they're missing digits, right? Or they're coming in with. With bad masking. 
So, I will show the screen really quickly. 
I guess just for a baseline, really quickly, I could go into our test environment, right? Four, we're still having, domain issues with our test environment.

**harry.dennen@llsa.com | 01:18**
Are you on.

**Speaker 2 | 01:18**
The pan am on the.

**Yoelvis | 01:25**
I think it's, book now instead of p.

**Speaker 2 | 01:30**
It's everything is booked now.

**Yoelvis | 01:36**
I don't know what's you're looking for.

**Speaker 2 | 01:40**
Just the add.

**Speaker 5 | 01:43**
You're trying to get the admin portal.

**Speaker 2 | 01:45**
No, the engagement portal.

**Yoelvis | 01:48**
Okay, no, mark and bulk is.

**Wesley Donaldson | 01:51**
Exactly.

**Yoelvis | 01:56**
All right.

**Speaker 2 | 01:58**
Well, maybe we'll skip the baseline then. Here's the PR environment, effectively, what the changes will be. So we're going to use our imagination on this one. Say you have a user who is coming in with something that looks like an email, right? 
But they somehow miss just one random thing, right? Like the dot. Effectively, once they start typing their password, you'll notice that their login button is still disabled.

**Wesley Donaldson | 02:28**
It is about. Six. Level. The e.

**Speaker 2 | 02:32**
So, this is kind of like the bulk of the change right here, right where we are just now introducing some validation logic on our email and phone patterns to make sure that they are fully qualified emails and phone numbers before enabling this spine. 
And we are not presenting any kind of, like, UI feedback that's holding the user's hand through it. Looks like you're trying to give us an email, right? But we didn't quite get, you know, a full email. Do you want to check that again? Likewise, for a phone number, if I just start adding in less than the available digits that I need, right? No dice. 
So as soon as you do get a full phone number in right, this will, your logging button gets enabled. Likewise. And if you added the dot write in a fully qualified email. I'm getting through longment as well for passwords. 
I think the logic around validating that you have a password input, it is still the same, right? We just want to make sure that it's not a blank white space, right? And then, that gets factored in as well. 
So that that's pretty much all I got here to present.

**Wesley Donaldson | 03:51**
All.

**Speaker 2 | 03:54**
And this again is just to limit the amount of bad input that's coming through.

**Jennifer | 04:00**
When we're getting bad input, how are we getting it if the login button is disabled?

**Speaker 2 | 04:07**
So, it's not currently right, which is what I was trying to show the baseline if I were to go to or hey, maybe I should just go to prad. Right? A prod address for EP is so we have to have them on the type top of their head.

**harry.dennen@llsa.com | 04:28**
My lifeline at livelinescreening.com.

**Speaker 2 | 04:31**
There we go. So here's our baseline, right? If I were to put it. And then. What was it what was my example, the one right? And then any password you get your logging okay, that's effectively what's happening, right? This is our baseline, this is what's happening today. Likewise, if I were to put in less than 10 numbers, right? 
And so we're seeing a lot of bad input right in scenarios like this with less than ten numbers, right? Or even up to just like 9, right? But your first number is a one. Or we're even having, users that are completely disregarding that. It says email or phone here and to please use the contact method you use when signing up. 
And they're putting in things like this, right? Like normal username autocomplete inputs that they would probably put in somewhere else that maybe their phone, right, or their browser is trying to help them out with.

**Jennifer | 05:36**
Have we looked at the requirements that we originally got for this? Because I know we had some validation and some expected errors that were supposed to show up here.

**Speaker 2 | 05:50**
No. Right. Primarily just trying to handle it as it is now in its current state, and because we've gone from both an old login form to a new login form. So we may want to just take a second look at what that UI feedback should actually be. 
Okay.

**Yoelvis | 06:12**
This. Yeah, my feedback for this is in general, it's not a good user experience to disable buttons, especially the submit buttons. The. You know, usually the best practice is just to allow the user to click the button if there is an error. We have two validations. The client side validations. Server side validation. 
If it's a client side error, we display the errors so they use a client identify. Okay, you are missing the dot or the e mail is not okay, fix it. Something about that. But you know, this an buttons is like it's not good in general because it's hard to discover what's wrong and it's better just to have it always enabled.

**Speaker 2 | 07:06**
So great, I agree, right? I think the challenge that we're having right now is there's a bit of a disconnect between what our users are most likely willing to do in the moment versus following some of these instruction when they are giving this feedback. 
And I think this feedback is fairly generic feedback, no matter what the scenario is, right? Whether it's phone number or email. So if they do get this feedback, their options are pretty much just call. 
Say you don't want to call, and you're thinking yourself, okay, well, something must have gone wrong. Maybe I'll just try this again. And then oftentimes what we're seeing in logs is it's the multiple tries, right, of the same things over and over again. 
Maybe the outcome is that we truly do want them to call. And if that's if that is the case, then we're okay with the logs as they're coming out in their current state and how the system is reacting to it.

**Yoelvis | 08:02**
Yeah. But my point is this is.

**Speaker 5 | 08:07**
Definitely don't want them to call, and it's absolutely necessary. I think this generic message is definitely driving people to call, which is not the greatest thing, but that's not what we're trying to address here. My concern is that we're not displaying any kind of error state as they are putting in invalid data in the lock in field. That doesn't that feels like we're just going to confuse people more. 
But I do want to balance this with we know that there's a small redesign coming and I don't know if these scenarios have been tackled in that. Those Designs. So I'll take that back for next step. For right now, Dane, because you've already implemented this change. I'm okay with disabling the login button, but I think we need to display an error message on the format that's inside of the email or phone.

**Jennifer | 09:10**
Yeah, Beth, I can help. Try to look at the error messages that we had previously. And we can just try like they might still be in there or we can try to stick those in.

**Speaker 2 | 09:22**
We do have some a handful of examples here of things that we'd see over and over again in logs. YS what were you going to say?

**Yoelvis | 09:31**
No, I was gonna say that. What I mean is the client side validations are not like we don't need to hit the server for those kind of errors. And my point is instead of disabling the button, we can just enable the button. 
But in the client side validation we say okay, the email is format is incorrect or email is required. Those kind of client s errors, you don't need to hit the server. We don't need to do anything like that. 
That's probably a future enhancement. I'm not saying that you need to do it here, but this is just my feedback for the general UX.

**harry.dennen@llsa.com | 10:11**
So basically run your run client side and your client side verification on click rather than like using a use effect or something.

**Yoelvis | 10:20**
Yeah. With the REACTBOOK form, it's a library we are using on e commerce. It works pretty nice because if it's gonna validate when you hit submit and then after you hit some mis go, it's validating every time you type. 
So. It's a nice, experience. And we could just probably use a library like that and just make the experience very nice. And it's easy because it's handled by the library.

**Jennifer | 10:55**
Errors here. And that second one makes me think that we aren't using the lib phone number like the phone number library that we had planned on using because the parenthesis would not cause it to like become an email address. CA I think that's what happened here.

**Speaker 2 | 11:22**
Yeah. No, definitely right, because as soon as you put in anything that's not explicitly numeric, right, it's being treated as an email. Yeah.

**Jennifer | 11:35**
So yeah, there's a lot that's wrong with this. It looks like it was done quickly.

**Speaker 2 | 11:44**
And it was. I mean, it to say, right, like as far as using, I guess, a library for standard formatting. To E 164 on a phone number. I think the masking is there, but right. It's not handling cases where we're explicitly saying. 
Well, do you have you given me, like, eleven or ten digits, right? Eleven in the case that you're giving me a country code, so, yeah.

**Jennifer | 12:09**
The library would handle that.

**Speaker 2 | 12:17**
I'd have to double check, but I don't believe we're using a library. We're just using a simple REGX pattern.

**Jennifer | 12:25**
Okay, yeah, that was part of. I know that was part of the requirements because Angela and I went over that a lot, so we can look into that one.

**Speaker 2 | 12:43**
So I takeaways, right? Small redesign on the way. We're okay with disabling the button however we want to present UI feedback. Do we want to do that before making this change?

**bethany.duffy@llsa.com | 13:00**
Yeah, I would say we can't push this out without the UI feedback because they think it's going to increase call volume because people are just gonna be like, why can't I get this button to enable?

**Speaker 2 | 13:09**
Okay. And then future stay right. Make sure we are using the correct libraries right for this INP and then do some client side validation instead of trying to hit the server on submit.

**harry.dennen@llsa.com | 13:24**
That sounds good. I mean, it doesn't seem like a huge lift to just do that. And then maybe product wants to come and evaluate the language we use just so we can get it out quick.

**bethany.duffy@llsa.com | 13:36**
Yeah, I'm good with that.

**Speaker 2 | 13:40**
Okay. Right. I'll take this one back, and then hopefully I've got something to show you guys tomorrow.

**bethany.duffy@llsa.com | 13:46**
Awesome. Thank you. Was there anything from anyone else that we need to chat about?

**Speaker 2 | 14:00**
Hope so.

**harry.dennen@llsa.com | 14:01**
Well, I was just gonna say shopify phone number stuff. Beth, if you want me to run through any of that or, I mean, a few conversations now.

**bethany.duffy@llsa.com | 14:11**
No, I think I'm clear on that now. I just needed to make sure that I was really relaying the right information back to our support team. So I let them know that orders after or basically nine a m this morning should all be good. There may be some that are missing phone numbers. 
So that's on me to take back to our business decision makers and see if there's a manual process we need to implement around that. But as long as the orders themselves are getting into CSTAR and someone can show up for their appointment, then we are all good. Actually, I just thought of something. Did we test if a participant that doesn't have a phone number can make it all the way down into FSA? 
Okay.

**harry.dennen@llsa.com | 14:56**
We tested all the way into a C star.

**bethany.duffy@llsa.com | 15:01**
Can we do a stand? And you check to make sure that one of these shows up in FSA correctly. Yeah, I don't I'm not quite sure how to do that. DJ might be a good person to ask. Okay.

**Jennifer | 15:15**
I think Devon's been in it most recently but Stefan might be able to help as well. Harry.

**bethany.duffy@llsa.com | 15:30**
I just want to make sure that I'm not overlooking that. And they don't show up to the appointment in FS as like what's going on?

**harry.dennen@llsa.com | 15:44**
Yeah, i' fine. I'll take. We'll take a couple of the ones in the successfully.

**Speaker 2 | 15:48**
Rerun with no phone number.

**harry.dennen@llsa.com | 15:50**
Or any of the ones with your phone.

**Speaker 2 | 15:52**
And just check. Let it.

**harry.dennen@llsa.com | 15:53**
Make it.

**bethany.duffy@llsa.com | 15:54**
Yeah.

**Speaker 5 | 15:55**
Awesome.

**bethany.duffy@llsa.com | 15:57**
Cool. Anything else?

**Wesley Donaldson | 15:59**
Yes, I was hoping Lance could join, but I can just bet on the conversation this morning. Lance's question around how we want to handle if we want to send a legacy of payment is not successful in a renewal. 
I think your direction is no. Makes perfect sense. My question or why I'd asked him to join was I wanted to talk a little bit about what's our plan for those? Do we just leave them as parked? That seems like a bit of a miss if. 
Like what? What do we want to do it from a business perspective with those.

**bethany.duffy@llsa.com | 16:33**
Sorry, with which ones.

**Wesley Donaldson | 16:34**
So we an order that comes to the from recuurly web hook we get we're trying to do a renewal that renewal like from what lands is seeing it doesn't have a payment successful on it. And what is. What is our plan of action for it? Do we just simply leave it as a part of it? 
Like we just acknowledge from the queue saying, yes, we receive this, but we do nothing with it? What's what should be our plan of action for failed payments on renewals?

**bethany.duffy@llsa.com | 17:02**
We should do nothing. So MMA is already going to fail inherently because it doesn't have a payment. Well, that's my assumption, so I'll need to validate that. That assumption is correct. I'm assuming MMA is going to fail on the renewal date when there's no payment applied and we'll flip the membership to expired or lapsed. 
If that's the case, then we don't need to do anything and it can just sit there. The only thing we should be doing is when an invoice is successfully updated on a subscription, we should be sending that over to MMA to update the payment ledger basically against the membership.

**Jennifer | 17:47**
So, West, it does sound like we need a trigger based on the invoice, not the subscription.

**bethany.duffy@llsa.com | 17:55**
Correct. So we have the Dunning cycle. The membership's going to stay active until the Dunning cycle is complete, and then it will flip to inactive. So someone may show active in recuurly when they're actually lapsed in MMA and we want them to stay laps because they should not be able to schedule an appointment if we didn't successfully collect their payment.

**Wesley Donaldson | 18:23**
Okay, I follow that logically. I think the part I'm still getting a little stuck at and maybe this is requires a Miro diagram is when we get a web hook for renewal like our what's our expected response for that if it's if we know it's failed, if we know it's already failed.

**Jennifer | 18:38**
So I think that we don't trigger based on the web hook for renewal. What we need to do is trigger based on a web hook for invoice and see if it's on a subscription and do it then. And I think Lance had that as an option. I can talk with him and see if this is. 
If this'll work.

**Wesley Donaldson | 19:00**
Yeah, let me just get a CI you, Jennifer, if you want to just, like, start a channel. And we could probably just do a live meeting if we need to. 
If he's not. Clear.

**Jennifer | 19:09**
I'll reply to his message.

**Wesley Donaldson | 19:12**
Thank you.

**bethany.duffy@llsa.com | 19:32**
Okay, anything else?

**Jennifer | 19:38**
I don't think so, Dane. I sent something in the indoor channel that I got. That might be easier to do for loggin. And those libraries may have just like error messages that are inherently in them that are standard as.

**Speaker 2 | 19:59**
I'll take a look.

**bethany.duffy@llsa.com | 20:06**
Okay, awesome. Thanks guys. That's it.

