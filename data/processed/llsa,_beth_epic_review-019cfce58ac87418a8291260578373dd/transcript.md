# LLSA, Beth Epic Review - Mar, 17

# Transcript
**Wesley Donaldson | 00:00**
Hey, Beth, you sound very good.

**bethany.duffy@llsa.com | 00:03**
All right, I am getting there, trying to...

**Wesley Donaldson | 00:05**
That's good.

**bethany.duffy@llsa.com | 00:09**
I know I have anti-nausea meds somewhere in my cabinet. I just need to find them. I'm just trying to drink water, but every time I drink water, it makes me feel... I don't know how to explain it, like watery. [Laughter] I don't know.

**Wesley Donaldson | 00:23**
My wife recommends that so much to her patients, and I'm like, "That's a real thing."

**bethany.duffy@llsa.com | 00:24**
There's just...

**Wesley Donaldson | 00:28**
People don't think that's a real thing. Like, no, stay hydrated. So. Like.

**bethany.duffy@llsa.com | 00:32**
Yeah, that was my husband all day yesterday, because he used to be...

**Wesley Donaldson | 00:32**
You know the power of that. Even though she yields.
And if not drinking enough water.

**bethany.duffy@llsa.com | 00:41**
My gosh, I'm forgetting the term a medical assistant for so many years. So yesterday he was like, "No, dehydration is what puts you in the hospital. You need to keep drinking water, even if you're throwing it back up."
And I was like, "I can't do it, leave me alone."

**Wesley Donaldson | 00:57**
They should meet at the same conversation. I thought it was like a big water was in on it or something like, "Why are you always pushing water on me?"

**bethany.duffy@llsa.com | 01:06**
Yeah, so I have been drinking. It's just tough, I feel.

**Wesley Donaldson | 01:10**
Fa enough. Like, I'm. I'm happy. You sound good. At least all.

**bethany.duffy@llsa.com | 01:13**
Yeah. Yeah.

**Wesley Donaldson | 01:15**
I see your epics.

**bethany.duffy@llsa.com | 01:15**
I'm getting there.

**Wesley Donaldson | 01:16**
What's that with that?

**bethany.duffy@llsa.com | 01:17**
Yes. So this is what I have for prod launch. The description I have for prod launch is basically the user can schedule their appointment via the website. The payment successfully collected in PayPal. Then the order is pulled out of her curly, stored into Krisp so that the participant can attend their appointment.

**Wesley Donaldson | 01:28**
Two.

**bethany.duffy@llsa.com | 01:32**
That's like base-level orders in Krisp. We know who they are, we know what they paid for, we know when they should be there, and we know if they're a member. Memberships are created successfully inside PayPal and the order and membership are created inside Krisp, in case you see that.
So basically full context. What happens if someone purchases a membership in PayPal? A membership order gets created in Krisp which generates vouchers, and those vouchers are used against the Krisp order as payment.
So the payment gets logged on the membership inside our legacy system. Those vouchers are used against the appointment order itself. So that's the full flow. All of that should be in place already as soon as it hits Krisp and Krisp, a lot of what's already there should be what's happening here, I believe. I don't quite know the scope of these things.

**Wesley Donaldson | 02:44**
So 2b1.2 is basically everything that gets you into Krisp.

**bethany.duffy@llsa.com | 02:45**
Which is what?

**Wesley Donaldson | 02:51**
That's the that's ECOM 3 API that we've talked about a few times.

**bethany.duffy@llsa.com | 02:51**
Okay.

**Wesley Donaldson | 02:55**
That's the event bridge, the event grid, all of those things get you into Krisp as it exists now.
In theory, per-Krisp diagram like all that stuff is a magical black box. So everything that once we get into Krisp, we are not touching anything on this side. Or at least that's the plan.

**bethany.duffy@llsa.com | 03:14**
Yes, that's outside of our scope, and we are doing UI training with them on Thursday this week and Rick Curly, so Rick Curly will be walking them through exactly that kind of stuff.

**Wesley Donaldson | 03:15**
So in theory, membership should work the same way. The only question I actually have on that side of the wall is how do we action any concerns that customer service may have with like a.
So with like a subscription or a membership like if we need a cancel, if we need to like discount any traditional customer service reactions to a subscription.

**bethany.duffy@llsa.com | 03:50**
How do I cancel a membership? How do I do a refund withinside where...?
Then we just have business processes on our side. In the event that they need to cancel a membership inside a recurring, they would just submit an IT request, and we would have our DBAs go in and cancel those memberships.
If they're not able to do it via the legacy UI that's an existing business process because we do have scenarios today where they try to cancel a legacy membership, and they're not able to do that. So we'll just be following existing business practices for that.

**Wesley Donaldson | 04:20**
Perfect. Yeah, the event bridge stuff like that is not needed for production for us to get to the production launch so we can actually take that.

**bethany.duffy@llsa.com | 04:31**
Which one?

**Wesley Donaldson | 04:31**
Well, 1.3.

**bethany.duffy@llsa.com | 04:32**
This okay, beautiful, because I was getting a little concerned with how many things are in here and we've got about 13 days.

**Wesley Donaldson | 04:33**
Yeah. 13 1.3. And 1.4. Those are all post production.
Yeah, no.

**bethany.duffy@llsa.com | 04:51**
Okay, where did it go? I just deleted it. No, I didn't... It is...

**Wesley Donaldson | 04:58**
I didn't clean up them relative to the new... As I said, I saw you're making that change. I go, "Crap, I need to get back and do this, clean up all of these for..." So I'm doing that for the new epics I'm creating.
If you want to just... I'll take a pass of that tonight. That way you have it for the first thing in the morning. But 1.2 and 1.1 are the critical ones. The one that I opened around ongoing that maybe because the direction from architecture was we should be making those updates as we touched them.
But in my mind, that's not on fire, so we shouldn't be doing that at all.

**bethany.duffy@llsa.com | 05:24**
Okay, yeah, so is this basically just tech enablement for recurring?

**Wesley Donaldson | 05:31**
That one right there, it's really what it is. No, it's not... It's less enablement, it's more optimization. As we touch a projector, we should make it match the new EMET pattern.

**bethany.duffy@llsa.com | 05:40**
Okay, got it.

**Wesley Donaldson | 05:42**
Is the goal of that?

**bethany.duffy@llsa.com | 05:44**
Can I call it that instead?

**Wesley Donaldson | 05:46**
Sure. On projections, you can say that because that's really what it is.

**bethany.duffy@llsa.com | 05:54**
Okay, it really is just projections.

**Wesley Donaldson | 06:02**
The graph is technically, it's a re-model. It's a projection in a way.

**bethany.duffy@llsa.com | 06:06**
Okay, that works for me. Let's see. I want to make sure these are in 1.5. So BI support, I would say this does need to be part of the production launch. What I don't want to happen...
This is a bad habit that we perpetuate with everything because of our tight deadlines because we push something out with no visibility into it for the business. So I need to make sure that Christian has what he needs coming out of recurring as soon as we have our first transaction.
So this probably needs to be prioritized as soon as you guys have an example of being able to submit in order all the way through.

**Wesley Donaldson | 06:54**
Exactly. That's the reason why I haven't pulled in yet.

**bethany.duffy@llsa.com | 06:58**
Okay?

**Wesley Donaldson | 06:58**
I don't have it. I don't even have an order yet that I can do a reaction on.

**bethany.duffy@llsa.com | 07:01**
Yes.

**Wesley Donaldson | 07:03**
Yeah, the goal of this epic is I should get more tickets for actually doing the things.

**bethany.duffy@llsa.com | 07:03**
Got it.

**Wesley Donaldson | 07:07**
But like, I need to understand why. But my thinking was I'll start this conversation with them. Ideally next week was the. Was the hope.
And then that should give me like what projections I need to build.

**bethany.duffy@llsa.com | 07:16**
Yes, perfect.

**Wesley Donaldson | 07:19**
Then you can use that pattern that we just talked about in the other epic but yes, it has to be driven by BI but I hear you.

**bethany.duffy@llsa.com | 07:24**
Okay, yeah, I just want to make sure Krisp has what he needs. Okay, so the rest of these is ready for Deb. This one I'll get over to you guys. Hopefully today should be pretty quick.
It's what I mentioned before, which is just installing that GTM script. We need one for development and one for production. I don't think we actually do. We have our production environment yet.

**Wesley Donaldson | 07:50**
Yes. So we launched that this morning.

**bethany.duffy@llsa.com | 07:53**
Okay.
Okay. Beautiful, so I'll create.

**Wesley Donaldson | 07:53**
So we launched a blue-green for that. In theory, once we switched to DNS, that should be able to become the environment.

**bethany.duffy@llsa.com | 08:00**
Okay, got it. So I'll drop them both in there, just make sure they're in the right environments, to do that's what I'm going to...

**Wesley Donaldson | 08:08**
Okay, so it's going to everything except for blue-green gets the dev one. So local like dev environment technically as well. Everyone that's not blue-green gets the development tracker.

**bethany.duffy@llsa.com | 08:24**
Okay, perfect. I don't know that they have the prod one configured yet. I will double-check with them and make sure, but if not, we'll have it before we go live.
Next one, membership discount. I'm going to push this one through today and then we can review tomorrow. For now, we're just going to use a permanent discount for membership. Stacey wasn't a super big fan of that, which I understand why, but we don't have time to work around referrals right now.
The easier path would be to change the structure of our membership so that it's not a dollar amount. So for now, we'll just move forward with a discount. So hopefully, you'll have that tomorrow.

**Wesley Donaldson | 09:10**
Is there a change? So this is going to be actually having the dollar value show up instead? Just for the first year, correct?

**bethany.duffy@llsa.com | 09:18**
Right, yeah. So this is what we talked about earlier, where they're grabbing that discount code from the available coupons and applying it. I want to talk through this one a little bit with the team. I don't necessarily want this code surfaced on the front end because there's not really a way to safeguard it if it ends up on a coupon site.
So it really should just be like... We are using this internally so that Recurly calculates to $30 off.

**Wesley Donaldson | 09:49**
What is the risk of it showing up on a coupon site?

**bethany.duffy@llsa.com | 09:53**
Anyone can use it.

**Wesley Donaldson | 09:55**
Cando like we in theory, you could come to the site and just choose and choose to pay for the membership and select the membership. We don't have a place to input the code. Wemm.

**bethany.duffy@llsa.com | 10:06**
So this is being created like any other regular coupon code. Recurly doesn't have a good way to build in the logic of if I'm buying a membership, then apply this code. It's just I can configure this code to be used on specific products.
So if I say it's a membership-specific code, it's going to take the $30 off of their membership price, and we don't want that.

**Wesley Donaldson | 10:31**
Watch here. Yes, okay, that makes sense. Should I have another? Brilliant question. Hell, was it? I don't remember. It'll come back to me.

**bethany.duffy@llsa.com | 10:43**
Okay, so we can talk through that with the team, see what kind of ideas they have. If it does end up on a coupon site, it's not the end of the world because there are coupons all the time, and they can only apply one at a time anyway.

**Wesley Donaldson | 10:58**
So from the MVP, we had an issue where we...
That's the thing I forgot we had an issue where the correct coupon code had to be live because we were hard coding it. So what we discussed was that we should be pulling from a list of available coupons, and it should be sorted by which ones are the right coupons effectively.
But now that we have the manual coupon input, which is my other question. We shouldn't be attempting to associate. We should have the user provide that coupon code.

**bethany.duffy@llsa.com | 11:25**
For regular coupons, which is what Jeremy is working on right now. This is specifically for the membership discount. So manually applying the discount. We shouldn't have to do anything until they click Apply.
Then we should be checking against the list of active codes inside of work early to make sure that it works, it's not expired, they have the eligible products added, and it hasn't exceeded any of the limits.
So that's for the manual add for the membership discount. It really is trying to figure out because we have this logic where if they select a membership discount in an upsell, then we give them $30 off. Rick, Curly doesn't have a way to build a coupon with that specific logic.
So we just have to use a coupon that we are creating. But I don't want it to surface to the public.

**Wesley Donaldson | 12:19**
Exposed exactly.

**bethany.duffy@llsa.com | 12:20**
Yeah.

**Wesley Donaldson | 12:21**
Perfect. This is minutia, but just be aware. I'm not having Jeremy work on the manual ad for the coupon. I just need to spend more time on the... I'm making some progress on the thrive side of getting the order into CTAR so I'm going to actually have him jump on that once he gets through just rerunning some stuff.

**bethany.duffy@llsa.com | 12:29**
Okay.

**Wesley Donaldson | 12:43**
So he probably had another day before he'll jump on the coupon stuff, so probably Thursday for him to jump on...

**bethany.duffy@llsa.com | 12:48**
Sure, got it. All right, so that's membership you guys already have help with. The century I assumed was part of this because it gives us the observability that we need.

**Wesley Donaldson | 13:02**
So it is... So this is actually... I need to refine this ticket. But effectively, each one of the 1.1 and 1.2 has its own specific century portion. And that really just stems from the idea...
It should be a secondary thing. It shouldn't be part of the effort itself. So I'll clean up for 91.

**bethany.duffy@llsa.com | 13:20**
Got it? Okay, all right. And then this is the webhook stuff, this is getting into CTAR we talked about BI and then this last one. I will get this refinement over to you guys if we can do it before production launches.
That is my preference because it's going to save a bunch of time on the support team, but if we have to pull it out, that's fine. Basically what happens is today we are just assuming a specific type of collection method in Shopify, which is the point of care instead of sending it out to a lab. There are three states where we are not allowed to do point of care because of regulations.
So we have a different item code inside of our legacy system to say, "Okay, no, this one is a lab reference and not a point of care. So what happens today is we insert the order into our legacy system.
But it ends up with no products inside of the order. And our legacy system because it knows that we don't allow the point of care for that system. So the order gets created, the participants get created, but there's nothing inside of the order itself. Then they just have to go in and add the products to the orders manually and then it balances itself out.
So it's not a huge issue. But if we can handle it upfront where we're saying, "Okay, if the appointment is in Oregon, North Dakota, or Connecticut, then it's these three product codes instead of the other three."

**Wesley Donaldson | 14:55**
Got you. So this is just a conditional for the state and then changing the product codes that we're passing. Okay, that makes sense. There's a mapping act task as part of 1.2. That sounds like the best place where that would live.

**bethany.duffy@llsa.com | 15:08**
Yeah.

**Wesley Donaldson | 15:08**
But if you... Charge to be honest, if we can maybe keep it at a lower priority because there is already a plan for it. I want the team to make more progress on 1.2 and 1.1.

**bethany.duffy@llsa.com | 15:18**
He makes sense.

**Wesley Donaldson | 15:19**
I think we're going to be close as it is without additional...

**bethany.duffy@llsa.com | 15:26**
I just didn't know if it would save you guys some time, but that's what I'm bringing up now.

**Wesley Donaldson | 15:31**
It's good, but next week, honestly, we'd probably take it. But just let's see where we are mid-next week and I think we'll probably take it's two ifments.

**bethany.duffy@llsa.com | 15:36**
Yes, got it. Cool, so I'll have it there. If we have to pull it out, we have to pull it out.
It's not going to be a big deal. It'll just be my stretch goal for production.

**Wesley Donaldson | 15:51**
Okay like it just quickly run through this again. So the one that just. I think 4 91 just needs to be removed from p two or what is this p52 from PRD 52.
That's probably the core of it. And then I can re. Yeah, you can actually do that. Now for 91, just remove it from PRD 52 because that's already covered in other tasks.

**bethany.duffy@llsa.com | 16:14**
Okay. I'll go ahead and do that. Then if there's anything that you're creating that I'm missing, just go ahead and add them.

**Wesley Donaldson | 16:24**
Yeah, the only thing I added recently was the post-workaround bugs that we had today, and I didn't use any of those as high priority.

**bethany.duffy@llsa.com | 16:29**
Got it. Yeah.

**Wesley Donaldson | 16:36**
What did I call it?

**bethany.duffy@llsa.com | 16:38**
I would say no, because most of what we were saying... Well, no, I will say the yellow and drop shadow not persisting that needs to happen before production.

**Wesley Donaldson | 16:49**
Okay, y yellow drop show.

**bethany.duffy@llsa.com | 16:50**
But the button sizes...

**Wesley Donaldson | 16:52**
We do that now.

**bethany.duffy@llsa.com | 16:55**
I can live with that. That's not going to hold up production. What else? Did we have two to do?

**Wesley Donaldson | 17:02**
A few things. We had the for the appointment times for 375 with displays. We wanted to make sure we're only seeing four across and not jumping to the next line of any display that is 3705 or higher. You just mentioned the color. We have the shortened date in the footer as well as towards the top portion of the checkout page.
I think it was... You had the star icon missing on the most popular banner, and you had the icon mismatches between the different... What library we're using internally within the code base versus what Figma was using.
The final one you had was we had more conversation around the prefixed for the order confirmation on the confirmation page. So right now we're showing the raw number we were discussing.

**bethany.duffy@llsa.com | 17:46**
Yes.

**Wesley Donaldson | 17:48**
We need a better solution for that.

**bethany.duffy@llsa.com | 17:50**
Okay, so the only one I would say I want before production is making sure that Yellow persists all the way through. Just because it was a very disorienting experience to not have that. The other ones, I don't think anyone would notice unless they knew what was expected from the Figma.
So those ones that we can push to post-production launch and just tack them very quickly.

**Wesley Donaldson | 18:14**
Okay. So then I'll just move you into the refactor ticket then. That's the easiest thing to do.

**bethany.duffy@llsa.com | 18:19**
Perfect. Then the prefixed thing. Recurly's documentation says we can configure a prefix inside of our invoice settings, but I don't see that anywhere. It might just be a permission thing. I might not be able to access those settings.
So, I will ask them about that in our UI training on Friday or on Thursday, because what I would like it to say is "a dash" and then the number if you guys want to add a dash and then a random last four at the end or something doesn't matter to me.

**Wesley Donaldson | 18:49**
Yeah.

**bethany.duffy@llsa.com | 18:52**
Or like a time stamp?

**Wesley Donaldson | 18:56**
My worry is just that if the user's able to refer to an order generally by only that number, in theory, they can... If you go and you book something, can they ever use your number which is now one increment higher?

**bethany.duffy@llsa.com | 19:06**
Yes.

**Wesley Donaldson | 19:08**
Can they ever use that unique code without some other sal. Without some other element of the number as a unique identifier?
That's my big worry. Like in any public system, can they do that?

**bethany.duffy@llsa.com | 19:17**
Yeah, they could guess it, but that may just be a training thing, right?

**Wesley Donaldson | 19:18**
If the answer is no, then it doesn't really matter.

**bethany.duffy@llsa.com | 19:27**
If someone says, "My order number is LLSA1204 and I pulled that up," I need to ask them, "Okay, what was your first name and last name?"

**Wesley Donaldson | 19:35**
And so prove it.

**bethany.duffy@llsa.com | 19:36**
If it doesn't match, then we need to try again.

**Wesley Donaldson | 19:39**
And like we won't make any changes unless you've authenticated. It's like a soft authentication half. Even though you have a valid number.

**bethany.duffy@llsa.com | 19:47**
Yeah. So I think that's more training thing. I would say let's not waste dev resources on the order number. I will figure out how to put a prefix just so that it's not like it just doesn't look like an order number right when it's just four numbers.

**Wesley Donaldson | 19:57**
You...

**bethany.duffy@llsa.com | 20:00**
So I'll keep working with her curly to figure out on the prefix thing. I don't think we need to waste development time on it, though.

**Wesley Donaldson | 20:06**
Okay, got it. All right, I added a comment for the issue 2661 on your screen. Look at that, only two minutes over.

**bethany.duffy@llsa.com | 20:12**
Okay, awesome. All right, awesome. Well, if you think of anything else, just let me know. But otherwise, I think that should be the final scope for what we need.

**Wesley Donaldson | 20:26**
Sounds good. Thank you so much.

**bethany.duffy@llsa.com | 20:28**
Right. Thank you. Bye.

