# Product X AppDev Office Hours - Mar, 11

# Transcript
**Wesley Donaldson | 00:12**
Good afternoon.

**bethany.duffy@llsa.com | 00:20**
Afternoon. All right. Westwitch ones, I heard. I sent it over a bunch over TV yesterday. Which ones did we want to run through?

**Wesley Donaldson | 00:35**
If we have the time, we can just blaze through them. So maybe start with coupon. It's pretty straightforward, but just to ground it.

**bethany.duffy@llsa.com | 00:42**
Give just a second share my screens. 
So this one is manually applying the discount. So this is that applied discount link in the checkout view. You'll click that and you can copy and paste coupon code in there, and then when you click apply, the coupon code should be validated. 
If the coupons valid, the code is applied and the discount is shown in the cart. If it's not valid, then an error is displayed. All of those states are in the Figma up here. The assumptions that we have. The two ones are already configured in recuurly. There should be some in recuurly already in the sandbox environment, but if you want to create new ones to test with, feel free to go for it. There's no harm in creating new coupons in the lower environment. 
And then the all of the information around whether or not the coupon is valid in the scenario should be available. And from the recuurly information. So we're currently holding things like whether or not it's expired, if the eligible products are added to the cart, or if it exceeded any of the usage limits that.

**Wesley Donaldson | 02:08**
Yes. Do we want to validate? How close do we want to validate? Only at the time of checkout, like when the person clicks the pay button.

**bethany.duffy@llsa.com | 02:21**
It should be both. I thought I had that in here.

**Wesley Donaldson | 02:26**
I may have missed it.

**bethany.duffy@llsa.com | 02:27**
Okay, yeah, sorry, second one here. But my as just completely scanned over this. So we want to do. When they click apply, we should be validating the coupon because most people aren't going to check out if they don't know what their final cost is going to be. 
So once they're applying the coupon, we should be updating the card information with it. And then when they click Complete Purchase, we should be making sure that the coupon is still valid. For example, someone might have left a coupon in their cart for a week and it expired last week. 
It's no longer valid, so we should be doing it at the complete purchase as well.

**Wesley Donaldson | 03:07**
Nice. This is maybe a nice to have. Maybe it's a B2, but I love it when sites tell me that my the value of my like Papa Johns, the value of your coupon is basically inferior to the value that's already there. 
So you can see that. Or do we want to just take whatever the last bond provided to us was?

**bethany.duffy@llsa.com | 03:30**
I for now, just if the. If the customer is putting in a coupon code, whatever they're doing is what we're accepting. So if they want to remove thirty dollar coupon code and put it in a ten dollar coupon code, then that's on them. [Laughter].

**Wesley Donaldson | 03:44**
There you go. The next one. Which 7:38 that was for the appointment time. I already had a bug or a defect in there for that one, so I just kind of moved that defect to the epic you have. 
And then you all already had it assigned to him. He was already he was. His status this morning was he was working through it. He didn't give a time when he think APR would be available, but it sounded like he had a good strategy of how to solve for it.

**bethany.duffy@llsa.com | 04:12**
Okay? Yeah. This one we wanna just use kind of the same. The same component that we were using for the appointment display. 
So this is just what we're doing here is kind of using that same, styling for displaying their appointment time up at the top and then redirecting them to the screening. We know that they have to start over and we know that that's not obviously ideal, but that is what we're doing for now until we move on to preserving the cart, which is a post production feature that we have. 
So, Les, I don't think I went over this with you, but I've been pulling things out. So everything that we need by the end of the month is in this one. And then these are all of the nice to have things that I am keeping track of as we reduce scope and putting them into some post launch features.

**Wesley Donaldson | 05:22**
Yep. Understood.

**bethany.duffy@llsa.com | 05:28**
Okay. So it sounds like there's not questions on this.

**Wesley Donaldson | 05:31**
No.

**bethany.duffy@llsa.com | 05:31**
You always do anything you need. 
Okay, do you want to talk about the help chat?

**Wesley Donaldson | 05:48**
Yes, please.

**bethany.duffy@llsa.com | 05:51**
Okay, so inside of the I EP, there is a chat icon that is already implemented. It's some kind of like Genesis script that we're using that's attached to Cobrows. All of that should already be configured. 
From what I'm understanding is we basically want to copy paste that into an instance for thrib e commerce and just get the plugin itself situated and then we will let it ops configure it for the different use cases and scenarios that we want to support. 
So it really is just getting it the integration in there and then the maintenance will be handled by the it apps team.

**Wesley Donaldson | 06:36**
Sounds good. The only reason I didn't pull this in like the ticket has a reference back to Forget. Was it Roy, the gentleman's name that you called out in the epic? I didn't have a visual, but like Jeremy, I assume you've seen the EP instance and you're familiar with where this link is. I guess. 
And bet your direction is just basically mirror where we're placing it inside of EP.

**bethany.duffy@llsa.com | 07:00**
Ye.

**Wesley Donaldson | 07:02**
Okay. Any questions? Jeremy, you all this on this one? Beth, if you want to open, 07:43. It's just a detallization of what's already in the epic, but.

**Speaker 3 | 07:15**
It looks like you said it in the other ticket, but basically it's always there in the corner or something like. Okay, yeah, that makes sense.

**Wesley Donaldson | 07:22**
Okay, cool, right? We should be able to take this one in.

**bethany.duffy@llsa.com | 07:27**
So the side effect of this will be replacing on the confirmation screen. There is this here where says questions about your appointment calls. Email us. This is no longer relevant and will need to be removed. 
So if we have this in our design, then we need to remove it.

**Wesley Donaldson | 07:48**
Don't move. Got it. Thank you.

**bethany.duffy@llsa.com | 07:56**
I do have that for the Designers, but we just made that decision yesterday, so there's not an update for that yet.

**Wesley Donaldson | 08:07**
That's all I needed.

**bethany.duffy@llsa.com | 08:07**
All right, he ready for Dov I did have question here.

**Wesley Donaldson | 08:12**
The sting.

**bethany.duffy@llsa.com | 08:16**
So the legacy order fulfillment. 
And then drive order. Do we have epics for these already?

**Wesley Donaldson | 08:31**
So give me one second. I'm just documenting that change. ALR Alright, I'm back.

**bethany.duffy@llsa.com | 08:39**
So these are like the data contracts for the web hooks and getting it into the Event bridge and then into Current and then into Azure.

**Wesley Donaldson | 08:41**
Yes. Yep, I can attach 52 as the parent to it, but if you search for recurrently the 1.2 and 1.1, those are the epics that cover or fulfillment through 1.2 specifically covers the thrive order. 1.2. Y start 1.23 needs to be refined.

**bethany.duffy@llsa.com | 09:12**
Okay, got it. I'll move these under the production readiness milestone that I have, and then I'll just.

**Wesley Donaldson | 09:28**
I may end up removing 1.3 because 1.2 has much some of that functionality, but 1.2 is strong and 1.1 is strong.

**bethany.duffy@llsa.com | 09:38**
Okay, got it. I'll remove the other one. Jeremy, it was assigned to you. So you'll just see that disappear because the work is being captured elsewhere. 
All right, I think that gives me what I need for now.

**Speaker 4 | 09:52**
Then we have a demo. But Ray said he wasn't gonna be able to make it to office hours. Did he ask anybody to stand in for him?

**bethany.duffy@llsa.com | 10:05**
What's the demo for? Nick?

**Speaker 4 | 10:10**
I cannot remember this.

**Speaker 5 | 10:12**
What it's it is the fix for Edmund portal sending the first name in the to interval would be.

**Speaker 4 | 10:23**
Yeah.

**Speaker 5 | 10:25**
Email address or quotes us your name.

**bethany.duffy@llsa.com | 10:29**
You have screenshots you just drop in a chat that you can validate.

**Speaker 4 | 10:36**
You can do that.

**bethany.duffy@llsa.com | 10:39**
I'm not familiar enough with it to be able to do the validation because I don't know what I would be looking at. So I would say just the screenshots in the chat and at mention Ray.

**Speaker 4 | 10:51**
We can do that. Does that work? Sure, if you give me a couple of participants, I can get itterable. Thanks everyone. Thanks everybody.

