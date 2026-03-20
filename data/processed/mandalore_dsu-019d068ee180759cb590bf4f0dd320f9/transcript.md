# Mandalore DSU - Mar, 19

# Transcript
**Speaker 2 | 00:16**
Good morning, guys.

**Wesley Donaldson | 00:17**
Good morning. Just cleaning up that, Confluence document a little bit. Part of my brain. Who needs the formatting to actually look good for it to be readable? 
Just give those a couple more minutes. 
Seven people should be enough to get us started. Okay, so few first apologies, team. I think I may need to move this for next this Thursday meeting to 10:45 next week. 
But going forward, it shouldn't be a requirement. So apologies for the lack of better notice. So let's jump stra in, shall we? I'm going to start with you, Antonio, because I have a few announcements relative to you as well. Are you here? Until you are not. 
Okay, all good. I'll just do a couple of quick announcements for the team. So two quick things. I dropped a meeting on calendar for just until we get to the end of next week. Just a small fifteen minutes. 
It's not status. The goal of that meeting is just to true up this. Documented like this is our source of truth. I think we're doing really good and keeping this updated and the team is moving really well through this. I just want to have a time for us to sync at the end of each day. Just to make sure we're clear on if this is truly accurate and what are blockers to kind of getting us to completing a particular step. 
So just fifteen minutes we could probably even do it over our teams. Be aware of that. The other important thing, just looking at the calendar and what I want why I want to go first. So by virtue of us kind of being really close on this, I think we should target as a team Friday for us to do an end to end test. Then Tony has a couple tasks around this and a good idea of effectively just running a process a script that will get us a full order that we can push into the pipeline pretty quickly. 
So targeting Friday as the date for us to kind of be able to do end to end on this. So when we go through your status, if you could just speak to if you think that's doable or not. We don't have to solve it on this call. 
But just if you could speak to the idea if we can get to end on the in the consumption order into current flow by end of day by Friday. So be aware of those. We'll get back to Antonio. Let's go with Miha.

**Speaker 2 | 03:12**
Good morning, everyone. So I've just finished replaying the last batch of the all order interpretations ready events. Jennifer is gonna check in it trouble how many events were sent? I'm gonna download the new events and check if we have any in the letter queu to basically make sure that we replayed them all, but I don't think there will be any that are replayable. In the meantime, I worked on MDL 652 which is purged. Dev, built pipeline. Instead of purging it periodically, I implemented an approach where, we will on destroy job of every PR environment. We will basically clean up the event streams because they're not required anymore. Once we close the branch, they will be never achievable. 
So it's going to be cleaned up once we Destroy the Branch. There's one follow up, which we talked about like a while ago to basically purge the current state of the event store DB and recreate that. 
So that's my next step. I'll as I said, I'm most likely that in the early morning of my time I do that on Monday. To be honest, I would like to avoid any issues with our dev environment considering the fact that we need to test the new features so we're good on the storage I would do on Monday and then we can revert to 32gb rather than paying for 64. 
And I implemented where is the ticket? It's in Revue manual triggered to pipeline for femeral environment creation. So now in order to create a PR environment, we will need to comment deploy on GitHub. 
And then GitHub will basically tag the PR with the deploy label and the environment will be provisioned. After the PR is merged or closed or the branch is deleted, it will automatically be Destroyed. 
So. And there's only a change for the provision step. But there's no change for the Destroyer job. So in case we have any PRs like documentation or something, we don't need the peer environments, they're not gonna be provisioned now. 
It's going to be done on demand. If developers think they need APR environment.

**Wesley Donaldson | 05:34**
Yeah, don't worry about that. Team Miha will demonstrate that on Friday and then we can have a larger conversation of how we roll this out. But just be aware this is coming. 
So me out. Let's make sure we do not push this the prod until we have that demo and we have kind of full team alignment.

**Speaker 2 | 05:52**
Absolutely.

**Wesley Donaldson | 05:53**
Okay? Let's go with. I don't think Franci is here. Franci. His status real quickly. He completed the booking that Lifeline book that Lifeline screening effort for us yesterday or the day before. He's working with Lance to help with the Azure environment configuration and pipeline build out, so he's good to go for now. Let's go to go ahead.

**Speaker 3 | 06:16**
One one comment on that on the booking one there. There needs to be changes in the US for the C card distribution to use the new domains. Do you want me to add to have a ticket for that? Or is there someone working on this?

**Wesley Donaldson | 06:28**
Yes. Yeah, let's just pair off line real quick and we'll get your ticket for I want to make sure it's in the right place. 
Sorry, Lance, I didn't see you there.

**Speaker 3 | 06:36**
Okay.

**Wesley Donaldson | 06:36**
And not to speak for you.

**Speaker 3 | 06:38**
This is me Francis is Francis.

**Wesley Donaldson | 06:41**
Sorry, Franci. All right, let's keep going Jeremy over to you.

**Speaker 4 | 06:45**
A question about the website change. Is the dev ur l any different or what is the WRL for the shop?

**Wesley Donaldson | 06:54**
That what means the thing.

**Speaker 4 | 06:57**
Okay.

**Speaker 3 | 06:59**
And for e commerce.

**Speaker 4 | 07:02**
Yeah.

**Speaker 3 | 07:03**
I think we should change it to booking@livewnebox.com because now is the one I see now is te e comm or something.

**Wesley Donaldson | 07:07**
That. Yeah, let's take that offline and, let's connect like, Antonio would build a blue green environment, so.

**Speaker 3 | 07:11**
Maybe that's just that that's temporary. So I think you can do booking as well. Okay.

**Wesley Donaldson | 07:19**
And he set up that temp, so let let's just take it offline and connect you two together. 
But I agree. Why not switch sooner rather than later? But for now, let's keep it a stamp until you guys can connect.

**Speaker 4 | 07:31**
Yeah, for me, I'm just working through the, recurrly transformation into C star data. There's just. I'm making good progress on it. There's a lot of different test cases, so I'm just making sure that I have all the data setups that I can truly, you know, start testing things and make sure it works.

**Wesley Donaldson | 07:51**
Good, so good, no blockers there. I'm projecting out mid next week as a target date. You don't have to answer to that right now, but think about that as a possible target date for completing this work so we can have a full end to end test with a couple days next week. Just Pigy, let me know your thoughts on that. 
If it's not one, let's just find a way to plan around what times you actually need. Let's keep going.

**Speaker 4 | 08:16**
One question I forgot to ask. I don't see Antonio on here. Actually, never mind. It was for Antonio, just how to get if there's a quick way to get the payload he had sent, like, easily out of our system. Or if there's a place that's being put. 
So that way I can kind of just run through some scenarios and copy and paste JSON to make sure that I have something up to date. But I messaged him so I'm assuming once he's available he'll just haing me about it.

**Wesley Donaldson | 08:38**
Yeah, I actually connected with him this morning, specifically around the idea of how do we have repeatable testing through the entire process? So he's actually going to be looking through actually setting up a script for us to be able to kind of populate and push orders through as part of that effort. Just. We can get him to kind of give us. Here's an expected payload as well.

**Speaker 4 | 08:58**
Okay, sounds good, thank you.

**Wesley Donaldson | 09:01**
Jiffco over to you.

**Speaker 5 | 09:09**
Hey no, I'm here, sorry was muton. Hey guys, good morning. So I am working on two items, one of them is the bigger one. Actually the big chunk is the coupon implementation. I'm deep into that and a few questions arise. I posted them to Beth in the chat. Have not this morning have not received expens yet, but just giving her some time to react I guess. In the meantime, I'm trying to do the less minor change, the less the smaller ticket on the UI changes. 
I think I will likely have appear for that in the next couple of hours. The unifying is a bit more challenging, but should be okay. And yes, at this time, no impairments, just need those clarifications on the coupons.

**Wesley Donaldson | 10:07**
Can I ask you to just maybe reach out to Lance Orange Germy, whichever is available.

**Speaker 5 | 10:08**
Thank you.

**Wesley Donaldson | 10:12**
They took their initial pass at couponing, so they have a good perspective on that. And then if I can ask you Jeff code to join the product sync. 
If you still need a little clarity from that, that's the best place to get some attention from product. That's their dedicated office hours time helpful for.

**Speaker 5 | 10:28**
Of course, I. Yeah.

**Speaker 6 | 10:29**
I would actually like to talk through just some of those questions, so let's plan on taking it to off hours.

**Speaker 5 | 10:36**
Yeah. That sounds good. Yes.

**Speaker 7 | 10:38**
Thank you.

**Wesley Donaldson | 10:38**
Let's keep going over las sorry, apologies. Lance unfortunately is not able to make this time for status. He did share his kind of his progress and he has a PR open for working through the web hook, so he got some feedback on that. He's peering with Antonio to close out that feedback. He's making good progress, and he's moving. Obviously, he's working on some of the pipeline, the your pipeline work with incorporation with Francis, so he's good to go. Let's keep going. You're all. Are you? W.

**Speaker 7 | 11:18**
Hey guys. Although I've been working on different initiative and especially the some configurations for saving e money and time on the GitHub deployment and yeah, other than that, I've been.

**Speaker 3 | 11:44**
I mean.

**Speaker 7 | 11:45**
I'm gonna finish the other tickets. I my target is for today, especially the pre ride and the test.

**Wesley Donaldson | 11:50**
Of? If you can try to get to a good perspective by end of day today, my hope would be for us to share your thinking in demo on Friday. 
So that's the best place to get everyone who would be relevant to this or would benefit from it. If not, just please let me know. But I think that could be a target for us to have your perspective to share.

**Speaker 7 | 12:13**
Yeah. I'm going to create a PU request with the changes and we can have the discussion with the within the PR.

**Wesley Donaldson | 12:20**
Okay, sounds good on your radar.

**Speaker 2 | 12:22**
Yeah.

**Wesley Donaldson | 12:25**
That working session that we talked about. Schedule like I use some of the time that we had for engineering refinement on Monday. 
So we'll just plan on having JFFCO, you and you, all of us joined to just do a work session of cleaning up as much of the styling issues and checkout as we can. I think that's everyone. Did I miss anyone? No. 
Okay, anyone unclear of their next task or anyone block in anything needing direct PR review? Jiffco K you had it start. Miha you had a lot of items in review. I moved some of these to Confluence. I gave you a couple of review on a few of these. I asked for a few direct reviews from maybe Dane and Harry as well on the playbook as an example. 
So some of these most of these should be able to kind of transition a little bit. But if you're anyone else is looking for a review, please raise your hand. And Tony has a little bit of bandwidth. You of us may have a little bit of bandwidth and helps out anyway. 
So please again raise your hand if you have not received the PR review fast enough. All right. If. No additional questions. Thank you, guys, so much.

**Speaker 2 | 13:35**
Thank you so much. Thank you. Have a good one. Like.

