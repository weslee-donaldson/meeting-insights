# Mandalore DSU - Mar, 24

# Transcript
**Wesley Donaldson | 00:31**
Good morning, team.

**Michal Kawka | 00:35**
Good. Morning. Morning.

**Wesley Donaldson | 00:58**
Yeah. Maybe I'll connect with you offline. There is a task that would be a really good fit for you, but I don't have transparency into your bandwidth, so maybe we can just connect offline to see if you can take one task related to order placement.

**Michal Kawka | 01:18**
Yeah.

**Wesley Donaldson | 01:21**
I'll send you the task. We can message all... We got Jeremy, Francis, and Devon. So Devon, I want to connect with you offline. Maybe you and you all this together. My thinking here is that I want to lean in a little bit harder on how you can help us vet the full checkout flow inclusive of orders getting all the way into the customer portal into the admin portal we have. End-to-end test that Antonio created.
I think we want to use those obviously, but want to talk about how we can just have a manual view into that as well.

**Yoelvis | 02:00**
For jerk.

**Wesley Donaldson | 02:03**
All right, let's get started, and we can hand off to folks. I don't see Mea on the call. I don't see Antonio.
So let's start with Francis. Francis, if you can speak specifically to the conversation you were having with FFCO.

**francis.pena@llsa.com | 02:16**
Yeah. I'm just waiting for the custom domains to be deployed to the API gateways, the new ones, and once that's done, I'll create the entries I'll... I'll... To them. They have a ticket and a place holding for them, but it's still missing their...
So... I believe he will deploy the post domains to the API gateway. Once that's done, I'll make sure that the SD is out there.

**Wesley Donaldson | 02:43**
Okay, can we put this in review then, since this is really just waiting for some...?

**francis.pena@llsa.com | 02:49**
Yeah, okay there, sounds good.

**Wesley Donaldson | 02:51**
Okay, I owed you a ticket on this thint di I owed you an implementation ticket.

**francis.pena@llsa.com | 02:59**
Yes.

**Wesley Donaldson | 02:59**
Okay, so sorry about that.
That's my miss. I'll get you an implementation ticket for 777. Okay, let's keep going. Jeremy, your next.

**jeremy.campeau@llsa.com | 03:13**
Good morning. I sent you a message, Wesley, about something small that we need the DBAAS to do. But I can still continue. I have all the orders, working, so I'm just making sure I'm getting rid of all the trash that I created in the process and cleaning up the PR so that way I can put one up.
I'll probably ping you and Francis to make sure I have the right environment variables and stuff. So just look out for that, okay?

**Wesley Donaldson | 03:47**
Excellent, and I think I'd mentioned this yesterday, if you had any chance to put any thinking into how do we verify orders on. Yes, we're now able to push. Yes, we're here. We're not able to push information into here. I feel there's a need to have a like here's what the data looks like on this side of the fence, and then here's what it looks like once it gets it over to CSTAR do we need to have a conversation of how to test that, how to verify that? You don't have to answer now, but just I'd love to have a chat and give your peer you on that.

**jeremy.campeau@llsa.com | 04:17**
Sounds good. I'll message you about it.

**Wesley Donaldson | 04:19**
Cool, right? Let's keep going.
So you're good to go. We took you, Elvis, and I, and Jeff, we had a pairing session. We went through most of the checkout flow. So we are going to move this out of pause and just address them as part of that other stream of work.
So nothing for you to do on this one up.

**jeremy.campeau@llsa.com | 04:36**
Yeah, I remember when I was working on it. I think some of them are already done, so...

**Wesley Donaldson | 04:41**
Okay, no worries. Jeff is not here. Just go... As you mentioned, he has jury duty this morning or could have your jury duty.

**lance.fallon@llsa.com | 04:41**
Yeah.

**Wesley Donaldson | 04:52**
He has put in the PR a PR for the coupon entry, so if I can ask for a stick quick look through that PR. He's been working with Francis and just getting us finalized on the blue-green for the production environment. Per Francis's status,
that's in good standing now. So he's clear on this. The other ticket that's up next for him is actually going to be around the implementation of the membership discount into the U environment.
Jeff, sorry for this that's the one I think would be a good fit for you to take. But again, we'll message offline. Let's keep going.

**lance.fallon@llsa.com | 05:32**
Hey, yeah, just working through the tickets that we assigned yesterday. A slight pivot to the new architecture. So I'm working on the package for the event grid at the moment. I believe the one above
is dependent.

**Wesley Donaldson | 05:55**
Yes, this is the larger box, and then this is the implementation within the box. So this is the implementation on the processor for dealing with the order created, and then it's a separate one specifically for membership renewal.
So that's this guy here.

**lance.fallon@llsa.com | 06:17**
Two.

**Wesley Donaldson | 06:18**
These two are membership renewals, and this one is for the order placed. This is the container that has all two of them.

**lance.fallon@llsa.com | 06:24**
Yeah, that's what I'm working with.

**Wesley Donaldson | 06:26**
Okay, how are you? You able to make it?

**Michal Kawka | 06:36**
Hi everyone. I'm still working on MDL743.

**Wesley Donaldson | 06:42**
I...

**Michal Kawka | 06:42**
I'm still waiting for the config. So in the meantime, I picked up another task. That's the one at the very bottom, implement tracking tag. So, I started... I'm basically analyzing the ticket, the code base, what needs to be done.
So that's at a very early stage. If I'm supposed to work on something else, I'm happy because I didn't invest a lot of time into that. So yeah, if there's anything else, please let me know. We discussed my most likely next task before the stand-up.
So I still have quite a lot on my plate.

**Wesley Donaldson | 07:24**
Okay, I'd like to get that plate emptied. So we were supposed... We think these are both already solved, so I'd like to see if you can just... Can you give me a 30-minute time box just to confirm that they are still in effect, or if they were already addressed as part of previous work?
Then the only other thing for you is we still have too many things inside of review. This one I'd love to get close out. Specifically, it was declined the last poll request. So if we can just... For you...
If I can say time box, two things. One pair with someone to get reviews and these to get these off the board to clear this. Like this should be about an hour. If we spend one hour just clearing reviews and then clearing these, confirming these are still relevant or not...
Then that should free you up to tackle whatever secondary task that we have.
You're all this to you.

**Yoelvis | 08:29**
Hey, guys, I've been... Yesterday I was doing some refactorings and UX improvements on the whole platform, and I have almost everything ready, but I'm just finishing some details that I want to present.

**Wesley Donaldson | 08:48**
Of course.

**Yoelvis | 08:49**
All the fixes are in today's meeting with the product.
Yeah.

**Wesley Donaldson | 08:57**
Do you think that's something that we're targeting today or is that tomorrow? I know we just went through this yesterday afternoon. So is tomorrow a better time for us to target?

**Yoelvis | 09:06**
No, not to today. I want to do it for today. Like DEA hours. Just to present the work. And...

**Wesley Donaldson | 09:16**
The only one I'm a little concerned about...

**Yoelvis | 09:16**
Anya.

**Wesley Donaldson | 09:18**
With L... This one. If you could just give me a comment, is this moot at this point?
What's the backup plan? I know we... But was it last week or the week before? We had a conversation with Rick Curley, but we didn't come to a resolution or a plan of attack. Now that we realize this approach will not work.

**Yoelvis | 09:37**
Okay. I can add a comment.

**Wesley Donaldson | 09:39**
Okay, and then just to go back to Jiffco's plate quickly. So FFCO has this membership discount. I'm not sure if you remember from the product app I have seen yesterday, but Beth gave us a pretty clear explanation of how we wanted to implement this. It had a couple... Go further in. It had maybe one concern around how we wanted to do the up...
Sorry, there are two tickets here. There is the actual UI work and then there's the actual applying work. So in the actual applying work, we had identified that there is a specific change we need to make as far as the unit amount as part of us creating the purchase.
So like that I feel it's a good fit for you because you were part instrumental in that flow. I can see the co taking the UI portion, but I think this would be best served by you spiriting this through. What are your thoughts on that?
If you... If obviously this is the first time you're seeing it. If you want to just take a look, I'll send you the link, take a look at the ticket, and then we can converse afterwards as you will. This sounds good.
I think we lost you all seven. You're still there. Okay. I'll take that as... I'll reach out to you and we can talk about it. Anyone else? Anyone who has not gone... Or, more importantly, is not clear about the next task that they're taking on.
Okay, alright, well, I guess everyone gets back a couple of minutes. You of us... Maybe you can hold the line and we can just have that quick powwow on that epic.

**Yoelvis | 11:42**
All right, I wasn't mu.

**Wesley Donaldson | 11:44**
Cool.
Okay, alright, so for this epic, as I mentioned, there's... This is regarding the membership discount. So this is not in putting a code directly into the discount code. This is just what happens when you choose the upsell for membership.
So we have the UI fix in the UI update to add and change it showing the -30, which is hard coded, as well as showing the removal of the first year free message. So we have that. Generally, what we're missing is how we actually solve the back end, which we agree that we're going to send a unit amount of zero and that's the ticket. As I mentioned, I think that would be a good fit for you. I took a quick look at the recurring documentation. I'm sure you did as well.
So that's where your insight came from. The image that I think Beth or Jennifer, whomever, had on the ticket. So take a read through. I think I'd love for you to work on this. Just because you have that prior experience in place with the place order. What are your thoughts?

**Yoelvis | 12:45**
Yeah, please assign it to me. I've been doing some extra research on that, and I am leaning more into the coupon codes, but I will discuss that with Beth to see what we can agree on.
But for the use case that we have, the recordly recommendation, I think is still the coupons. I want to dig more into that so I can explain what's the difference and why it matters.

**Wesley Donaldson | 13:17**
Do you think you have enough information to have that conversation today? I just want to leave a little bit of runway for us to work on this and have it completed by the end of the week.

**Yoelvis | 13:29**
Yes.

**Wesley Donaldson | 13:30**
Yeah, okay, so that's another topic for... Product... Okay, perfect. That's assigned to you. We spoke about that one, this feature flagging I saw. We pulled that back in. Is there a specific task you're tackling as part of this, or is this more just you're taking the time to just take a look at how we want to use feature flagging in the... What?

**Yoelvis | 14:01**
Yeah, I have some ideas on how to approach that, and I'm just trying to understand. I think that's important, but I couldn't actually start on that.
I just wanted to finish the discoveries that we had yesterday so I can move.

**Wesley Donaldson | 14:18**
Come...

**Yoelvis | 14:20**
But to be honest, yeah, but I had some ideas.

**Wesley Donaldson | 14:22**
Yeah. Let's move it back there. And.

**Yoelvis | 14:27**
I just want to do more research and try to understand the... And how we are using the app... But for the front end, I think we need to use a proper platform for vision... Rather than AWS.

**Wesley Donaldson | 14:46**
A fan of Launch Darkly if we ever want to investigate that one. All right, I think we're at time. Thank you guys so much. Again, please... Reviews are still a challenge for us as a team, so let's make sure we're trying to support team members in getting reviews completed. Thank you guys so much. Aye. For now.

**jeremy.campeau@llsa.com | 15:05**
Thanks. Have a good one.

**Michal Kawka | 15:06**
Thank you. Talk soon.

