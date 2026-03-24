# Product X AppDev Office Hours - Mar, 23

# Transcript
**jeremy.campeau@llsa.com | 00:27**
That. So that was what I was going to plan on doing. But I guess the downside would be... I don't know if this is a downside per se, but there would just be one adjustment for the overall adjustment for the whole thing instead of having multiple adjustments.
So I don't know if that matters, but the way I'm thinking of doing it now based on just the discrepancies and stuff is once the orders are thrown into CStar, looking at what the price is based on all the item prices and then just getting the difference and having one giant adjustment.
So it would just say "Recurrly adjustment" and it would be for however much that is. So take into account whether or not there was a voucher, what Recurrly said there was for a discount, and then any price discrepancy between what's in CStar and Recurrly.

**bethany.duffy@llsa.com | 01:17**
Yeah.

**jeremy.campeau@llsa.com | 01:18**
That works.

**bethany.duffy@llsa.com | 01:19**
For me, from a product side, we really don't care how it's balanced, just that it is zero dollars inside of CStar because at the end of the day, they need to be able to show up and it populate on the FSA and it not look like they owe money.
Okay, so that's really the concern there. I would just run that by Jennifer from a technical perspective to make sure there are no concerns there.

**jeremy.campeau@llsa.com | 01:42**
All right. Yeah, I think I saw that she was out today, so I can hang her and then prepare tomorrow or something and explain it.

**bethany.duffy@llsa.com | 01:49**
Got it. Okay. Yeah. That seems more future-proof because I'd rather not be hard coding values because we expect this to move pretty quickly as we start adding new stuff in there. So the only thing I wanted to mention when you say voucher, you're talking about the membership voucher, right?

**jeremy.campeau@llsa.com | 02:08**
Yes. Yeah, I think it's like $30 or whatever.

**bethany.duffy@llsa.com | 02:12**
I don't think you would have to apply that as an adjustment inside of CSTAR because that should be auto-applied as the voucher from MMA.

**jeremy.campeau@llsa.com | 02:28**
So I need to apply the voucher if they have a discount. That's $30 for the add-on. As I honestly don't have a full understanding of how the vouchers work. I just know that for the membership, they show up, and then that's supposed to go towards something in the future because it's part of your subscription, I believe, but how it...
Yeah, that's all I know about it.

**bethany.duffy@llsa.com | 02:52**
Inside of CSTAR, when you create the membership, two different vouchers are generated: one for $197 which covers the cost of the appointment, and one for $30 which covers any additional blood tests. Those are then applied against the appointment order as vouchers and not adjustments or discounts.
So you should be... Double-check with DJ. But that's the way it's working in Shopify today, where the voucher gets applied against the appointment order, and then the adjustments get applied on top of that.
So I don't think you have to include the $30 voucher inside of your adjustment total.

**jeremy.campeau@llsa.com | 03:28**
Yeah, that's what I was planning on doing. Now that I'm thinking about it, though. So if you bought the membership and you have the add on and you've you or sorry, you purchased a membership and an add on, that means you'd get a 30 dollars discount, but that's actually a voucher inside.

**bethany.duffy@llsa.com | 03:45**
So...

**jeremy.campeau@llsa.com | 03:46**
Yeah, but I need to apply the voucher to whatever that item is like it... I don't... I guess I don't know how it works. So does it say if it's applied or not or what direction should I go there?

**bethany.duffy@llsa.com | 03:59**
I would say double-check with DJ. I want to say... And they should handle that themselves. It's doing it in Shopify today already. So if you purchase a membership through Shopify, it generates those vouchers, and then those vouchers are applied against the appointment order.

**jeremy.campeau@llsa.com | 04:15**
Okay, yeah, I'll double-check with DJ on the whole voucher thing.

**bethany.duffy@llsa.com | 04:19**
Okay? Yeah, I just want to make sure we're not doubling up between a voucher being applied via car and then doing a $30 adjustment on top of that.

**jeremy.campeau@llsa.com | 04:28**
Yeah, definitely.

**bethany.duffy@llsa.com | 04:33**
Okay, so that is the first one. And then PSD Product Code isn't in the Krisp test database. Interesting that it's not in the lower database.

**jeremy.campeau@llsa.com | 04:53**
Is the item is it just representing the forget what the actual Product Description was? Because I think I sent a screenshot of one item, but it was the Product Description was co sorry, the product code.

**bethany.duffy@llsa.com | 05:08**
Let me double-check Krisp really quickly. I might not have copied that over correctly. Yeah. The... Okay, let me change that and... Really quickly for you.
I forgot that I validated that with Matt and then forgot to update it.

**jeremy.campeau@llsa.com | 05:41**
Okay, so and then I think that's it for the questions I had. So I'll... I was saying, I know some people joined late, so I'll just say it. For the adjustments in Krisp, it'll just be one adjustment.
That's the way zeros out. It's not going to be dependent on certain items or whatever. And then I just have to double-check on how the voucher is applied in Krisp to make sure that it's not double-added for the adjustment, but that it's actually applied to the order if they've purchased the add-on with the membership and make sure that it shows that correctly.
It was the product code that was wrong. But the effects in that. So.

**bethany.duffy@llsa.com | 06:37**
Yes, I did just update that in our demo environment. I will make sure I update that in prod as well because I think they just copied over my settings, so I'll get that in our production.

**jeremy.campeau@llsa.com | 06:49**
Okay, cool. That's all I had.

**bethany.duffy@llsa.com | 06:54**
Okay, I'm just writing the notes in the chat really quickly.
Okay, cool. So that takes care of that one. Then, Wes, you had a couple that you wanted to chat about. I did add some details to the GTM one so that one has more information in it. Now, do you want to start with the membership discount? That one's probably more complicated.

**Wesley Donaldson | 07:30**
Yes, I was hopeful Jiffco could make this call as he would be. Yes, I was hopeful Jiffco could make this call as you'd be the one implementing that. But this is recorded. So yes, if you want to... Could you please just close out the loop on the tracking one?

**bethany.duffy@llsa.com | 07:41**
It is not recorded. But I will start the recording. Yeah. Yep.

**Wesley Donaldson | 07:53**
I think we talked about there should be different tracking for environments, and I just wanted to make sure that we had a code for lower and a code for production environment. I guess my question would be, we don't want to hard code the logic. Do we want to just... We can do an in-of-you, a secret, or some other mechanism to inject the identifiers inside of the tracking cookie. I assume that's the only difference.

**bethany.duffy@llsa.com | 08:19**
Doug, this is more your wheel house. We're talking about the, you go right here, the GTM script. Yep.

**Wesley Donaldson | 08:31**
I see that. Yes, GTM should be the deliverer. Okay. What is for...?

**bethany.duffy@llsa.com | 08:41**
Do we have the finalized one for production yet, or do we need to weigh on that?

**Speaker 4 | 08:48**
It's... We'll need to wait. The finalized production one is going to be a modified version of our existing production one. Okay. We'll be adding in rules to differentiate tags between the new environment and the old website.

**bethany.duffy@llsa.com | 09:05**
We're aiming to go live probably early next week. Is that enough time to get it updated?

**Speaker 4 | 09:14**
Yeah. Really, we're not going to go... I don't think there'll be any tags firing on this immediately except for analytics, so there'll be time basically just making sure nothing fires except for analytics.

**Wesley Donaldson | 09:20**
Mying on this analytic? So my favorite sorry, my question.

**bethany.duffy@llsa.com | 09:28**
Okay, got it.

**Wesley Donaldson | 09:31**
"So you just mentioned that some additional events or functionality outside of the base dev instance."

**bethany.duffy@llsa.com | 09:32**
Go ahead.

**Wesley Donaldson | 09:41**
I guess my question is, are you injecting that into GTM directly, or is that something that's going to be written into the script code itself?
Like, do I need to basically do another build to get that production instance, or am I just switching out the GTN identifier for is for the death and sensory abduction and sly the CR of Resolve?

**Speaker 4 | 09:55**
No, you can use the same. Well, this code is for the deb instance. There is a production instance that I need to send over. I guess as well that'll be the version of this that's for production.

**Wesley Donaldson | 10:10**
Okay, in my experience, we're just really changing out that one value. See right there, GTM and then the identifier.

**Speaker 4 | 10:16**
Yeah, that's all that's changing out.

**Wesley Donaldson | 10:16**
Yeah, okay, cool, perfect.

**bethany.duffy@llsa.com | 10:20**
Got it? Okay, so we can get the structure there at least and then just swap the value.

**Wesley Donaldson | 10:26**
Yeah, I think we're looking to make this configuration. That way we don't have to deploy a new code. So it should just be updating a secret inside of AWS.

**bethany.duffy@llsa.com | 10:37**
Got it. Okay, any other info you need on this one? Last, we'll pull up membership discount.

**Wesley Donaldson | 10:45**
No, I think that's good.

**bethany.duffy@llsa.com | 10:52**
So this one is a little bit different than what we initially talked about. Wesley, you always did some... Come on, it doesn't like my image. Let me regrab it.
So there's actually a way to do just an adjustment at the end of a recurring order, which means we don't have to mess around with any coupons and coupon configuration, all that kind of stuff. We're just going to implement logic that if they have a membership order and an upsell item, then we do a $30 adjustment and insert that total into recurring instead of the recurring calculated amount.

**Wesley Donaldson | 11:36**
All right. Were you thinking that we would do this at the time of order creation? Would we do this as a backend admin process that runs every x number of days?

**Yoelvis | 11:48**
No, what I discovered is that when we call the create purchase, we can specify the unit amount, and we don't need to... You know what we configure on recording is the foul number if we don't send any number.
But if we want to specify a different number for unit amount, we can do it. So pretty much in the checkout process, if we know we are going to decrease $30 from a particular line item, we can do it.

**Wesley Donaldson | 12:28**
Okay, so then this is at order creation time then. So as part of the place order functionality.

**bethany.duffy@llsa.com | 12:35**
Yes.

**Wesley Donaldson | 12:36**
Okay, makes sense. So can you just go back up? The rules don't change here, right?
So it's still the if the membership is applied, the dollar value for the membership that we should be pulling from recurring, not assuming it's $30.

**bethany.duffy@llsa.com | 12:56**
No, for now, you can just assume it's $30 because we. We will be reworking this at a later date. There's nowhere inside of Recurly for us to configure this.

**Wesley Donaldson | 13:06**
Okay, perfect, so assume it's $30. This is hard-coded implementation, we have the membership check for state that should be already there. Yeah. It's pretty straightforward.
Squeeze scroll that a little... You were going to ask me just to share where in the documentation you found that. I could probably just control F for that, but if there is a specific document that you had... If you can add that to technical considerations.

**Yoelvis | 13:32**
Yes, I think I showed up, but let me find that again.

**bethany.duffy@llsa.com | 13:35**
Yeah, I only had a screenshot, but if you have a link, I can drop it in here.

**jeremy.campeau@llsa.com | 13:39**
Yeah.

**bethany.duffy@llsa.com | 13:43**
Part of this, Wesley, is the UI piece is just making sure that $38 is being shown in the scenarios where we have the add-on inside of the card, right?

**Wesley Donaldson | 13:52**
Instead of free for the first year or whatever we currently have.

**bethany.duffy@llsa.com | 13:56**
Yeah, two.

**Wesley Donaldson | 13:57**
Okay. This is CLA. If you have any questions, we'll add it to the ticket and we'll bring it back to the next session.
This looks pretty... This is enough for us to get started.

**bethany.duffy@llsa.com | 14:09**
Okay, like this. Ready for Doug? Do you want me to put the GTM in? Ready for Deb too? Beautiful. Awesome.
Alright, I do have a takeaway on the help chat. I need to just get with Asa and Tom really quickly to see if they want that chat forwarded to the existing queue or if we need to set up a new chat queue for them. I don't think that's going to impact me. Hall, what you're doing, I think it is more on Rob's side for the configuration that he has to do.

**Wesley Donaldson | 14:52**
Any questions from your conversations...? Anything you're unclear of? And sorry... I apologize. The tracking would be for you. So if there's something you have... You have a question or an uncertainty there?

**Michal Kawka | 15:06**
No, three. So everything's clear so far. We have a conversation together with Rob and Beth. So Rob is currently investigating how we need to set it all up in terms of implementation. It's really pretty straightforward because we already use that library on the Thrive page, so no concerns, no blockers.
So far.

**bethany.duffy@llsa.com | 15:27**
Awesome. I'll try and get an answer by the end of the day for which queue we're sending it to.

**Wesley Donaldson | 15:36**
Perfection.

**bethany.duffy@llsa.com | 15:39**
All right, anything else I need to go over?
Well, if anything pops up, just send me a message. Otherwise, I'm sure I'll talk to you guys later.

**Wesley Donaldson | 15:56**
Talk to you later.

**bethany.duffy@llsa.com | 15:57**
Thanks.

**Wesley Donaldson | 15:57**
Later?

**Yoelvis | 15:58**
Thank you ti laterit.

