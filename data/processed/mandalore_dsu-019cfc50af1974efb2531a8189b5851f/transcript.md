# Mandalore DSU - Mar, 17

# Transcript
**Yoelvis | 00:18**
Hello.

**Wesley Donaldson | 00:19**
Good morning.
Save everyone a couple more minutes. Do you know who owns that Jennifer who owns the integration meeting? Can you forward that meeting to me, please?
Okay, let's make sure we're recording this yet, and then we can jump in. All right, not that. So let's start with the priority items. Is it me? How do you understand? We should be running this job on Wednesday.
But we had a few more items that you were working on relative to... Catch us up on that.

**Michal Kawka | 01:18**
Sure thing, yes. Hi everyone. So I wrapped up the postmortem. I pushed it to a branch on GitHub so it's ready for review. I know it's most likely supposed to be a Confluence page or a document, but I think our environment is GitHub, so I pushed it to GitHub for visibility so all developers can review that.

**Wesley Donaldson | 01:33**
[Laughter].

**Michal Kawka | 01:40**
Once it looks good, we can bring that to Confluence or any other format that we want, so your reviews are much appreciated. I have one PR ready for review, which are the other QUES alerts for the unmonitored queues.
So that's just an infrastructure change, so no user-facing impact. So if someone could take a look at that, it would be awesome to merge it as soon as possible. I'm currently working on the leg resolution code-based sweep.
So I'm performing an analysis of what's our leg switch workflow is. I'm making sure that it's consolidated in one place and the logic is consistent. I should be done in like two hours after the stand-up or something.
So I'm not really sure. What's the output supposed to be? Should I document my findings in the ticket? Create a Markdown Confluence page for documents so that would be helpful.

**Wesley Donaldson | 02:46**
So create a Markdown for it. And then I need that markdown to determine to kind of distill and bring that back to architecture to see if we need to modify the two weeks ago plan around additional monitoring.
So conflating things make the markdown. And then from that, Markow, we could determine if there are additional tickets that we need. Once you get through that, then the existing this is these two are very much related.
So if I mean, I would suggest you kind of do these in parallel and then that read me should basically give us everything we need to kind of get ticketing or pushback on architecture around this topic.
But these two are very much related.

**Michal Kawka | 03:22**
Sure thing. Yeah, thank you so much.

**Wesley Donaldson | 03:23**
Okay. Just keep going. Any blockers on rerunning for tomorrow morning around the additional park events?

**Michal Kawka | 03:34**
No, I'm ready and steady, so I just need a green light and then I can kick off the script and we will replay the rest of the events. It's going to be around 3000.
I think it makes sense for me to download them again and verify if there's any new DA that were parked, but I don't think so. So in the end, we're only replying the ones that were caused by the PDF LLaMA.
So I'll double-check. But I'm ready to push the button.

**Wesley Donaldson | 04:00**
Okay, just messaging the teams and just confirm with Ray that we're still planning and launching it tomorrow morning. All right, Jeremy, over to you.

**jeremy.campeau@llsa.com | 04:11**
Yeah, I have to pull in one change because I have my other tickets merged, so I have all the work tonight. I'm just going to make sure that I didn't break anything and that I'm not going to overwrite changes with the fix that I have.
Then you still want me to pick up the 756 as my next ticket? I know we talked about a bunch of different stuff.

**Wesley Donaldson | 04:33**
Yes. 6756 is number one with a steaming hot bullet.

**jeremy.campeau@llsa.com | 04:34**
Okay.

**Wesley Donaldson | 04:37**
So much so, I'd say this needs to be abandoned. If we cannot clear this in that time box, 30 to 30 minutes to an hour.

**jeremy.campeau@llsa.com | 04:46**
Sounds good.

**Wesley Donaldson | 04:47**
Okay? So let me know. Put it in the paster block if we can't clear it in 30 minutes and then pick up 07:56. That's the most important. The other items on your plate are lower priority. I'll most likely have... How? Take these on towards the end of the week. Once he completes the SE tasks.
Okay, Chifco to you.

**jeremy.campeau@llsa.com | 05:07**
Okay.

**Speaker 5 | 05:16**
Hey Tim. So yesterday I implemented the new requirement on the ticket, and then later in the day, following our discussion on alerts, actually added a Jira letter queue to the new Jira as well. It's not in the requirements, but I read it in the Slack because we want these alerts if something happens with the events not being processed. Much later in the day, I got a bunch of comments on the reviews. Thank you very much, Wesley and Antônio. I cleared those out.
Right now I actually was trying to deploy the stack. Apparently, if it's from a branch I cannot see it in the GitHub actions, so I cannot deploy it through GitHub actions until it's merged to main. I was trying to find a workaround for that, but don't want to break out of stuff.
So ultimately what I'm doing is trying to emulate from my local what GitHub actions will do pretty much there. That should happen shortly. Right after that, I'll be turning the ticket to you guys. This time, no impediment. Skill.

**Wesley Donaldson | 06:29**
I pulled 07:11 into your queue.

**Speaker 5 | 06:29**
Thank you.

**Wesley Donaldson | 06:31**
It's part of... I think I want you to get close to what your Elvis has done around Century. I think... Want to make sure that you... Since you're looking at the stack of the team is working through the lambda, the two additional lambdas around making sure that you're checking with them and verifying that we have instrumentation around Century and Natives, which sounds like you touched on some of that already.
So this is a very similar ticket to what you're currently doing. So to peer with Lance, Jeremy, and L's on this ticket, depending on what we ultimately do. I'd like for you to take on some of the smaller stuff that we have on Jeremy's plate, around the chat icon and things like that.
So just give me a sense of the level of effort by maybe the end of the day today of what you think is left on 7/11 or what needs to be done on 7/11.

**lance.fallon@llsa.com | 07:16**
Sounds good.

**Wesley Donaldson | 07:18**
Okay, Lance to you.

**lance.fallon@llsa.com | 07:24**
Okay, yeah, the process is updated based on the requirements. I don't have a PR yet. I'm going to wait for JB to merge the CDK stack and I'll merge that into mine and then combine the my app in it.

**Wesley Donaldson | 07:46**
Nice. If you feel like you're in a good place and you're a bit of a wait to pair with Jeff and to get CDK closed out, I think if you can start taking a look at 07:46. This is self-explanatory, but take a look at 07:46.
It's part of the second epic around how we get orders out of Century into CSTAR. That may require some research, so start with that. There's a confluence page like that we're gathering much of this research and maybe just hydrate that pair with Jeremy as he's doing something similar with the mapping task as well.

**lance.fallon@llsa.com | 08:22**
And how is that work? Is this one specific to ECOM or how does this differ from the mapping ticket?

**Wesley Donaldson | 08:28**
So it's the mapping ticket is just to understand the DTO of Shopify. This ticket... There's a bit of clarity needed. There's a Confluence page that explains what the e-com 2 API does. This is to create a copy of that e-com 3 with the expectation that it'll be custom rules for that de-duplication or whatever specific to the recurring order.
So that's just the direction we have from architecture. I think what I ask here is just to verify the plan relative to that and then give us feedback within that Shopify area that we have that we're keeping track of all these conversations.
Sorry, one quick thing before I go to your Elvis. We have a few things on the board that are still defects or issues that we were resolving from MVP. One is the 15 minutes... We'll touch on that already. We have it in "Ready".
So we owe the product a review of all these things. I'd love for one team member to be able to do that. I guess my ass would be you... Person who's led us through much of these. Do you have enough insight on all of these? Or is it just faster to have the engineer join Jira and just be able to present these to product?

**Yoelvis | 09:57**
I think I can present. But the only thing is about the 15 minutes... I mentioned that we still need to fix the core in order for this to be production-ready because now after 15 minutes, the appointment is always locked.
But it's not ideal.

**Wesley Donaldson | 10:20**
Yeah, I wouldn't worry about that for Mandalore. Let's make sure we're... You've already raised it up. So good on you. So that's... I think we'd agree that... Or would take on that because we're not touching anything outside of the gateway API as part of this effort.
So that's... It has to be the separate team. So good caveat there. You feel... So that you feel comfortable taking the other things that are inside of that are relative to the MVP. Jiffco, I think you are the only other...
Right? You're the only other person that had one that's ready to go relative to the MVP. Okay, perfect. Anything else that's on your plate that we should be aware of?

**Yoelvis | 11:02**
No, I'm good working on that account ID thing. I have an approach. I still feel like storing in the database would be the ideal solution, but I am working around with this idea of Russ turning the IDs and trying to reuse them.

**Wesley Donaldson | 11:23**
So this feels similar to me to kind of. What's one that's current for?

**Yoelvis | 11:27**
It is not ideal in some cases because sometimes the data could change between the free price and things like that. So it's not that we can't reuse anything we get from the back end. If we don't know exactly what we send in the previous trials, it's going to be a problem.
But, yeah, time to figure it out.

**Wesley Donaldson | 11:52**
Yeah. Take a look at this ticket. It's not the exact same thing, but it's related because this is like the front-end software. The recurring solved. This is like our de-duplication on the back end. It just doesn't want to have duplicate effort.
If this is still needed based off the direction like spaces, we should be using this. But at the same time we have this need for validating the backend for dupes. Just put some thinking into if this is still needed.

**Yoelvis | 12:19**
Yeah, for me, it's like it's tricky to make this work without a proper DA database, like taking care of the process, but, yeah, let's see.

**Wesley Donaldson | 12:34**
Okay. So just a couple of meetings for the team. I think Jeff, Jeremy Lance, and your office are already attending. We have an integration meeting with Ricurly this afternoon at 1 PM, where we normally have the architecture meeting.
If you could please prioritize attending that meeting, we're going to be... You're all curtaining here. We're going to be talking through the webhook and just integration recurrently. So good conversation relative to the work you're actively working on, additional consideration for the team.
So, Beth, I saw that you just joined. We have... We all will be joining the product office hours to present the work that we currently have inside of the ready for prod. So these are going to be all of the discrepancies or the fixes that we have from the MPP work. Jeff, going a couple of team members are not joining that just to stay heads down on the recurrently work.
But you, all of us, feel comfortable... He can represent that work for you in the demo.

**Yoelvis | 13:30**
Yeah, w when is the meeting with Rick?

**bethany.duffy@llsa.com | 13:35**
Curly, you should be on it. It said placeholder. It looks like 01:00 pm Easter.

**Yoelvis | 13:40**
I am asking about the other one, the one Wesley's talking about now.

**bethany.duffy@llsa.com | 13:45**
That's just our 12:00 pm office hours that we hold every day.

**jeremy.campeau@llsa.com | 13:52**
Alright [Laughter] alr.

**Wesley Donaldson | 13:54**
Yep, and the only thing that's going to be outstanding there, Beth, would be we're still working on this one. I've asked... I've asked, Lance to charm me to timebox this. Just if there's still outstanding work.
I think we have to pause it so we can get him on the recurrently, the ingestion work. So if that's more than thirty minutes of it, this may be paused. It's only a small amount of fixes. The only other thing outstanding was you... All of us already has on this plate the account ID for do duping coming from recurrently and passing that back to recurrently, so that should be everything.
That's critical from the MVP epic and the PP follow-up epic. Cool. The last thing I'll say is that we shared this document last Friday. I'll remind folks, and I'll be highlighting and coloring here. Let's use this as your source of truth.
If we come through something, please make a point of making it green. I would say if you're close to a PR and you're just looking for feedback, maybe add a comment on this. Just saying PR available just to make sure we have that one central place where everyone can go and see where we are with the integration work. All right.

**jeremy.campeau@llsa.com | 15:12**
Just a quick comment. I do not have the meaning for one. So could you send that to me?

**Wesley Donaldson | 15:17**
Same. So whoever has that meeting if you agree with the board...

**bethany.duffy@llsa.com | 15:20**
With Curly, that's just the recurring meeting to go over our webhooks.

**Wesley Donaldson | 15:22**
Yes.

**bethany.duffy@llsa.com | 15:26**
I can add whoever needs to be on it and it was I think you all this and Jennifer. But whoever I guess has been working on the web hooks may need to be on that.

**Wesley Donaldson | 15:41**
I don't think I'm mandatory.

**Yoelvis | 15:41**
Yeah, it would be nice.
It would be good if they can join.

**bethany.duffy@llsa.com | 15:48**
Sorry, my dogs are being crazy. Who needs to be added to it?

**Yoelvis | 15:56**
Antonio, me.

**bethany.duffy@llsa.com | 15:57**
Please.

**Wesley Donaldson | 15:58**
Me as well.

**bethany.duffy@llsa.com | 16:05**
I will forward those others.

**Wesley Donaldson | 16:14**
If you could add Jiffco as well. All right, good folks. For my apologies, we're at time, and I do need to run.
I will see you guys in the office hours, which will present some work completed to the product team. Bye for now.

**jeremy.campeau@llsa.com | 16:30**
Have a good one.

