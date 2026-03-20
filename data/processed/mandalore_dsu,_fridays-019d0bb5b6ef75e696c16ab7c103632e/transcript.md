# Mandalore DSU, Fridays - Mar, 20

# Transcript
**Wesley Donaldson | 00:26**
Good morning, all.
Right, I think we have enough to get started. Good morning, everyone. As I love to say, TGF, let's jump in. We had a productive week, so let's keep it going. Let me share my screen. All right, Meha. Let's start with you. We don't have any more...
Sorry. Can you give me the final status on the run? Yesterday we only had about twelve hundred to go. I think I saw that was fully complete. Just confirm.

**Michal Kawka | 01:27**
Correct, that was fully complete. Let me open the corresponding thread. So yesterday after the replay we sent actually including the replay the day before. So 2000 plus around 1,200. We sent in total 1,500 emails notifying the users that all results are ready.
So it looks like those users didn't proactively check the system to view their results, because if they had, we wouldn't send the notification. So we sent in total 1,500 emails and 1,200 SMS messages. The replay was fully complete.
I will look into the park events today again because we are still parking some events, but these are most likely because the participants are missing a first name or email, which is wrong and these are not repliable.
I'll look into that. But the corresponding ticket basically which was only above all results ready was completed and we replayed all the events.

**Wesley Donaldson | 02:33**
Perfect. This actually works really nicely with the rest of the items you have in review. Just give me a status of the D LQ and the other item we have in progress.

**Michal Kawka | 02:43**
Sure thing, yes. So in terms of the DL queue, it's still in review. I don't want to bother anyone of you to review that. If you have time, please do that. I know everyone has a lot on their plate, but if you find five minutes or something to review, that's a pure infrastructure change, no user-facing changes.
So even if there's something wrong, we can merge it and fix. We shouldn't influence any parts of the system; it's just monitoring. So, a review would be much appreciated because it's been in GitHub for quite a while. In terms of PCH to death abuse pipeline, I'm currently testing that document, existing dashboards, and reports in AWS. I wrapped up the document, pushed it to the branch, and it can be reviewed. Manual trigger to pipeline for FML environment creation is ready for review. Harry left a comment yesterday which I addressed.
I didn't address it because it was a question I answered. We should be able to show it in the demo today, but there's one catch. We can show in the demo before merging the domain that the infrastructure is not provisioned because there's a gate.
But if you want to test and show that on the command that we post as a comment, we provision infrastructure, we need to merge it to main first. So, it really depends on what we want to show in the demo.

**Wesley Donaldson | 04:15**
Let's pick one of the items that are just like an MDF update. Let's use that to... Normally, that would still trigger any new environment, right?
So, with this change, it shouldn't... Let's use that as an opportunity. So, let's just push one of these through effectively. This one feels small to me. I think I looked at this morning. If you identify one PR that you have that we can demonstrate the deploy functionality with the part of...

**Michal Kawka | 04:42**
There's actually two. So, I think we can show the... If it works because I'm currently testing that if the purge to death built pipeline works, we can show that as well, because that's just an extra step in the destroy job for PR environments.
We can show the ephemeral environment creation.

**Wesley Donaldson | 05:01**
Perfect. As far as what's on your plate next, I move the spike back to just paused. I think we absolutely need to start. As we talked about, I want to start working through the chat functionality we identified.
For example, coupon was a little bit more detailed than we thought yesterday, so I don't... This feels simple to me, but let's start attacking it. Plus, we have two more small items that I expect to be coming to you, one around web trends tracking.
So not web trends. Google Tag Manager attacking Web Trends. How old am I? So we'll get those over to you, but if you can focus on trying to close these out like now, and then I want to start making progress on the help the chat help. Cool.

**Michal Kawka | 05:38**
Certainly. I'm glad it's finally seven new features.

**Wesley Donaldson | 05:42**
Exactly. Let's go to Antonio.

**Speaker 3 | 05:47**
Hello, Tim, good morning.

**Wesley Donaldson | 05:48**
Nine.

**Speaker 3 | 05:48**
So I have this one in review. It's a manual pipeline to give us the ability to create some... Yeah, okay, to give us the ability to create some purchase.

**Wesley Donaldson | 05:56**
That was weird. You go.

**Speaker 3 | 06:07**
So it basically uses the Recurly SDK to do we interact with the sandbox the Recurly sandbox and then create some purchases and memberships for us. See the webhooks coming and then we can make the ingestion the API transformation, and the SQS being populated and the streams as well.

**Wesley Donaldson | 06:30**
Basically, this is...

**Speaker 3 | 06:37**
Yeah, that's correct, that's the flow. I just need the URL configured, the webhook URL configured on the Recurly sandbox. I'm not sure who is responsible for that. Now I can take a look. If no one is looking for yesterday, we talked a bit about DNS if I'm mistaken, but...

**Wesley Donaldson | 06:58**
Yeah, so sorry I messed everyone on the chat. The items that we discussed yesterday in the fifteen minutes on the state of integration, they're all messaging the chat. Take a quick pass. I covered all the things that we identified.
So one of those things, Antonio, that's assigned to you is actually this validation. SQS to Dall-E that's part of this larger effort. But generally, I left them in planning. I just need folks to take a quick pass and just make sure we're aligned to them.
So for you, Antonio, it sounds like you're cool. I'd love for you to demo that, but you're locked in. Then we have a couple of the smaller ones for you as well.

**Speaker 3 | 07:39**
I cannot fumble until we have the URL configured.

**Wesley Donaldson | 07:43**
Okay, if you want to pair with Lance because he did the... We can go to you as a good transition.

**Speaker 3 | 07:44**
On. On? Yeah, on the recurrly, I just need to.

**Wesley Donaldson | 07:52**
If you want to appear with him, he'd be a good person to take you through how he's got the web, how he tested the webhooks for 07:28.
So, Lance to you.

**Speaker 3 | 08:03**
Okay, go ahead.

**lance.fallon@llsa.com | 08:06**
I'd ask to speak to that. And we don't have a like a custom domain set up right now. It's pointed at a PR environment API gateway. For the sake of denot today, I'm just gonna keep that available. But I didn't.
And then if you want to just te me out towards. I can show you how. Any way that's set up. That would be beneficial 1S.

**Wesley Donaldson | 08:35**
Cool. Sorry. Real quick. Let's close the loop on that real quick, Francis. I'll message you offline. There are a couple of things for you to take a look at, specifically around what Lance and Antony just mentioned.
I'll message you offline, so... But don't worry about them. They're not too new to you.

**lance.fallon@llsa.com | 08:49**
Okay, alright, no problem.

**Wesley Donaldson | 08:52**
Sorry, let's keep no.

**lance.fallon@llsa.com | 08:56**
Okay. The e-com 3 API is deployed and tested to pipelines and releases work independently of the incoming to API. It does already have a certificate figure on IIS. The only remaining work there would be... I don't know how it was set up to interact with the van grid if we had custom domains or if anything else had to be configured, but the API itself is up and functional.

**Wesley Donaldson | 09:33**
I don't see an PR on this. Is it because it's in the Azure code tracking space?

**lance.fallon@llsa.com | 09:41**
He is not really a PR he the.

**Wesley Donaldson | 09:44**
Okay.

**lance.fallon@llsa.com | 09:44**
So it's just cloning the pipelines, releases, and then cloning the repository and testing to make sure it was operational.

**Wesley Donaldson | 09:53**
If I can trouble you just to... You already added them actually, perfect, never mind then. Okay, so we can move this through in review.

**lance.fallon@llsa.com | 10:01**
I yeah, if he wants to.

**Wesley Donaldson | 10:03**
Yeah. Okay, who do you...? I think you need to elect someone to do the review just because it doesn't have the normal flow. Is this something that Jeremy's the best person to give your review on?

**lance.fallon@llsa.com | 10:18**
I mean, I know.
He's pretty locked in but not sure who else would be your candidate.

**Wesley Donaldson | 10:29**
It might be worth getting someone from Endor, just as another person to take a pass at it. But we can sync offline on that as well.
The few things that we talked about yesterday, specifically the connector coming out of current, that one's on your plate as well. Okay, sweet. Jeremy, to you.

**lance.fallon@llsa.com | 10:48**
Have yous all out of sign this morning.

**jeremy.campeau@llsa.com | 10:56**
Good morning. So I'm able to get the orders into C Star, but there's still a few bugs for different scenarios that I'm working through, so I'm just making progress on it.

**Wesley Donaldson | 11:13**
Okay, so those are looking good. You have this in progress. Is this something you're just tackling in the background? If it's not blocked, it means...

**Speaker 6 | 11:21**
I thought of you.

**Wesley Donaldson | 11:22**
But if you need to move it to pause, I'd rather take a pause on this.

**jeremy.campeau@llsa.com | 11:26**
It wasn't... Pause. I haven't worked on it. It was in pause the other day. It must have just gotten accidentally changed or something, but, yeah, I haven't been working on it.

**Wesley Donaldson | 11:37**
Okay, we need to tackle them, but after we get through these. Okay, well, good. Jffcode. Let's go to EIX.

**Speaker 6 | 11:46**
Good morning, Tim. So yesterday I completed 763.

**Wesley Donaldson | 11:47**
He.

**Speaker 6 | 11:51**
I put the PR up and the message in the channel. I think, Antonio, you've put ice today there. If you could please complete the review or tell me if anything needs to be updated there or for anyone else, if you would like to take a pass, I did.
Please do as well. Yesterday during the beta product office hour, I got important clarifications on the coupon codes. Seems like, however, the product wants us to handle much more cases in terms of how the coupons are set up.
So I continued on my coupon implementation ticket, which is 741 currently working on it and I think I should have the PR later today.

**Wesley Donaldson | 12:37**
Open.

**Speaker 6 | 12:40**
So making good progress there. No impairments at this time. Thank you.

**Wesley Donaldson | 12:50**
Okay, let's keep going. Do you want to. Do you have anything that you're working through?

**Yoelvis | 12:58**
Yeah, I've been working on a few different initiatives and research, but yeah, now I am doing some tweaks to the continuous integration improvements I've been working on and I want to get back to my tickets and have the time to finish them, but I haven't.

**Wesley Donaldson | 13:05**
Yeah.

**Yoelvis | 13:21**
I would try to do that today if possible.

**Wesley Donaldson | 13:23**
If I think this is the one that concerns me the most for going to production because this is part of just our DUP strategy. Have you had a chance to kind of put some thinking into possible approaches to solve this?

**Yoelvis | 13:37**
Yeah, I did an implementation, but the issue is not the issue of the we had a conversation with pro and probably the way we are doing that now is okay, so we may not need to move forward with this. Da.
So we can have that conversation, in the in any another meeting with probably each one.

**Wesley Donaldson | 14:05**
That's on. I think my worry with that is that's on Wednesday.
If I think we could probably just get to a decision if ideally before then if they if the direction is just we don't need to push that account ID anymore when we're passing information back to recurrly, can we just get to that clarity and just close out the ticket if we need to do it.
And yeah, okay, sorry, just yep.

**Yoelvis | 14:22**
Yeah. Yeah, I can. I can clarify that today.

**Wesley Donaldson | 14:29**
Then I had one item I had suggested for you for demo. Just like I think it's around Blacksmith generally actually, so let me know if you're aligned to that and if it's far enough along where you feel comfortable demoing it.

**Yoelvis | 14:40**
Yeah, sure, I can demo that.

**Wesley Donaldson | 14:43**
Sweet.
Okay. Anyone I miss that's actively working through something, or anyone currently blocked or unsure of their next ticket? No. Okay, so reminder we have that sync meeting this afternoon. I'll use that as an opportunity for us to go through the tickets that were created relative to these additional identified items. I reached out to Beth and to Jennifer to help us with just confirming the production configuration for Recurly and Francis. I owe you a conversation, but if you took a look at...
I'll send you a couple of tickets for you to take a look at their infrastructure. Tickets. And Antony, I think you need to speak into the blue-green production instance as well.

**Yoelvis | 15:23**
Okay.

**bethany.duffy@llsa.com | 15:28**
Wes, say production configuration for Curly. What are you talking about the.

**Wesley Donaldson | 15:32**
So I think it's more of a question for us. We're just unsure of...
I assume you guys already set this up for us. There's a bit of a handshake that needs to happen between them. That's the H Mac signature key. So just need to get that into configuration for the production environment and just want to confirm that we are giving that production environment the right path for where they should be sending the webhook events.
So there's a little configuration outstanding. It's not building a new environment, it's just how do we connect them properly?

**bethany.duffy@llsa.com | 16:03**
Okay, got it. I just wanted to so that is outside of my wheel house. I wanted to make sure it wasn't like you were waiting for products to be configured inside of recuurly or anything like that.

**Wesley Donaldson | 16:11**
No, yeah, we trust that you guys are already set up and good to go and the production config, and it's just more like the handshake between the two systems at this point.

**bethany.duffy@llsa.com | 16:12**
So, Jennifer can probably speak to that one.

**Wesley Donaldson | 16:25**
Cool.
All right, guys, again, thank you so much. Great effort in just getting us completed here. Great effort in getting us towards being able to pull information pushes in the C star. So stay the course. Let's... This afternoon.
I'm more worried about unknowns, things that we're not aware of. So please, if you run across something and you're not sure that meeting this afternoon is a good place for us to raise it. Thank you so much. Enjoy the rest of the day.

**Speaker 3 | 16:51**
I guys start you later.

**jeremy.campeau@llsa.com | 16:52**
Have a good mikerchief.

**Michal Kawka | 16:53**
Too. Later. Thank you. Thank you.

