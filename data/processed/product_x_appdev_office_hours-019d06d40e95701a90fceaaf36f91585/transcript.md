# Product X AppDev Office Hours - Mar, 19

# Transcript
**bethany.duffy@llsa.com | 01:16**
I think I just needed to chat with CO on the Mandalor side, and if you guys want to start with anything you have...

**Wesley Donaldson | 01:16**
I...

**Speaker 3 | 01:29**
Yeah, I have a quick one again for a bug fix and not a bug fix, sorry. It's for removing the yellow banner and the lag in the page, so sharing. So this is the user story. Just removing the login button. Currently, it looks like this one.
So, in our production front end, there's a yellow banner in here. I removed that one. It's my environment that's still deploying, but I can show it to you locally, so it will look like this one.
So it will look like our front. Well, yeah. The front. It will look... Look like this without the yellow banner. Is that good or do we need adjustments?
Yeah, that's it. Is that good or...?
It's finally going to happen. Yes, it is okay.

**bethany.duffy@llsa.com | 03:09**
Yeah, normal yellow, no yellow. Okay, cool, that's it, thank you, thanks. Serman.

**Speaker 4 | 03:31**
Have you had a chance to look at my questions, please?

**bethany.duffy@llsa.com | 03:35**
Yes, let me pull them up really quickly. Okay, so the type of coupons, I can't guarantee that there'll always be an amount. So I'm not sure how that impacts your implementation. Our marketing team could be in there creating coupons for anything at any point.
Then go ahead.

**Speaker 4 | 04:06**
So what I was thinking is yes, they can be in amount or in percentage. Basically, those are the two options, right? The thing is, percentage of what? That's why I think we should look at the questions more holistically. My next second. The second question is, would the coupons apply to the cart or is it to individual items?

**bethany.duffy@llsa.com | 04:32**
That depends on the configuration in recurringly, so I would lean into the recurringly documentation to see what the configuration inside of the coupon is doing.

**Wesley Donaldson | 04:36**
The...

**Speaker 4 | 04:42**
I think recurringly allows both. It's what we are doing. My recommendation would be to keep it simple and apply the coupon to the card but you tell me.

**bethany.duffy@llsa.com | 04:53**
Well, it depends. If the coupon is configured to be applied to a specific item itself, then it's not applied to the cart, it's applied to the item.

**Speaker 4 | 05:04**
So you're saying from a product standpoint, we are not limiting to what it can be applied.

**bethany.duffy@llsa.com | 05:11**
Right now we should be pulling the configuration from Re:Curly and using the coupon configuration as the guardrails for when and how to apply it.

**Speaker 4 | 05:23**
Okay, we can do that. Just a bit more complicated, but yes. Okay, that sounds good. This is the qualification I needed.

**bethany.duffy@llsa.com | 05:32**
Okay, the last one too. For right, our general use case is just that we only apply one coupon at this time but I think that again, that could change in the future and should be part of the configuration as well.

**Speaker 4 | 05:46**
It's not in the design right now, by the way. Do you want me to change the design?

**bethany.duffy@llsa.com | 05:51**
No, don't change the design. I'm just saying that should be part of the check when applying a coupon is it configured to be stackable or not? Inside of Re:Curly.

**Wesley Donaldson | 06:03**
So that from a design perspective, we should just support being able to list multiple coupons in the UI.

**bethany.duffy@llsa.com | 06:10**
Let's take that as a separate enhancement. I don't want to waste time on that right now.

**Speaker 4 | 06:17**
Okay, so design supports only a single coupon that's how we keep it right now.

**bethany.duffy@llsa.com | 06:22**
Sure, yep, that works.

**Speaker 4 | 06:24**
Okay, sounds good, thank you very much. Those are my questions. We'll put answers in the ticket just so we have tracking there.

**Wesley Donaldson | 06:31**
Yeah, I got you. I'll take care of that CO so just focus in reading through. I'll. I'll love it. Tick it for you.

**Speaker 4 | 06:36**
Sounds good. Thank you.

**Wesley Donaldson | 06:50**
Beth, I had one quick point, but I could... Since you're here, I want to message you.

**bethany.duffy@llsa.com | 06:57**
Sure, go for it.

**Wesley Donaldson | 06:59**
The conversation we had yesterday, this is relevant to you as well? Our plan of attack, as we agreed, was just to do a working session with maybe two engineers. Didn't they invite you to a session on Monday where we're going to take the first pass of fixing as many things as we can identify?
Plus all the things that you identified... The thinking would be to bring that to you in the next products app sync as opposed to having you try and sit with us for an hour.

**bethany.duffy@llsa.com | 07:23**
Sure, yeah, that works for me.

**Wesley Donaldson | 07:24**
Okay? Co.

**bethany.duffy@llsa.com | 07:31**
And then Devon, for the end-to-end test plan, can we try and review that in one of the office hours maybe early next week?

**Speaker 3 | 07:44**
Yeah, that works.

**bethany.duffy@llsa.com | 07:46**
I'm just thinking, similar to what we did in Shopify, right? Where we tested all of the different permutations of the... What they could have purchased. So nonmember by itself and then nonmember plus each of the upcells, then member by itself plus each of the upcells. Where it's going to get complicated this time is because we have those add-on tests. We'll need to do the negative tests to make sure that, when they're adding conflicting tests, those aren't getting sent over and causing downstream issues.

**Speaker 3 | 08:24**
Understood. Okay. Yeah, that shouldn't be too tall of a task.

**bethany.duffy@llsa.com | 08:32**
Awesome. So that's the standard path and then just testing the restricted state path to make sure nothing's making it through. For that one, I think that's it. I'm mostly concerned about just making sure that things end up in Krisp correctly.
So if you can think of any other data points that could be tweaked in testing around either the participant profile, membership status, appointment, payment, or the products that are getting added...

**Speaker 3 | 09:10**
Okay. Alright, yeah, I'll send you some special...

**Speaker 4 | 09:17**
Use cases.

**bethany.duffy@llsa.com | 09:18**
Okay? Awesome.
Alright, do you have anything else?

**Wesley Donaldson | 09:36**
Not from adeor.

**bethany.duffy@llsa.com | 09:40**
Okay, thank you.

