# AppDev Leads DSU - Mar, 17

# Transcript
**Wesley Donaldson | 00:12**
I don't know what you're referring to. My friend?

**greg.christie@llsa.com | 00:17**
Hey, morning guys. Beth, how are you feeling?

**bethany.duffy@llsa.com | 00:21**
Good morning. I am getting there. I am still very much dehydrated, but I'm making sure I'm drinking water. I'm scared to take any Tylenol or anything because I'm just nervous. So I'm just trying to eat some carbs
and drink some water. Luckily, the kids seem to have bounced back, they're acting totally normal, so that's good, but it was a rough day. It was not fun.

**greg.christie@llsa.com | 00:48**
Yeah, it sounds terrible. I didn't realize they had... They were sick at the same time. That makes it even worse.

**bethany.duffy@llsa.com | 00:53**
Yeah, my two-year-old started at about 11:00 pm and he was thrown up about every 15 minutes until 4 or 5 am. Then somewhere in there I started. Then halfway through the day yesterday, my four-year-old started. Luckily my husband got skipped over, so it must have been something the three of us ate and he didn't.
So because that was not functional at that point. So he ends... [Laughter] Up with all the kids' stuff.

**greg.christie@llsa.com | 01:19**
What's the ledger on the mend?

**Wesley Donaldson | 01:21**
No.

**bethany.duffy@llsa.com | 01:21**
Yeah, me too.

**Wesley Donaldson | 01:24**
So are you dealing with that?

**bethany.duffy@llsa.com | 01:26**
Time just seems to go so slow when you feel like crap. Yesterday was the longest day of my life. [Laughter].

**greg.christie@llsa.com | 01:32**
It's horrible. Yeah, it does, because. And then. And then. Plus then you're, like, waking up too, so it just makes it even longer.

**bethany.duffy@llsa.com | 01:38**
Yeah.
Stas, while we're waiting and correcting to... Maybe you guys can help here. Change management on the marketing side is causing... Well, the lack of... Is causing chaos on Shopify. The over 150 orders that we had fail from Thursday were due to some marketing plug-ins that got added to Shopify that were breaking the checkout process, and we had no insight that new things were being installed onto Shopify.

**greg.christie@llsa.com | 03:43**
Well, that's what. Yeah, that's kind of what part of the reason why I'm installing Doug where I am is because he really needs to be and will be the kind of gatekeeper for all that stuff. And this is why even with why he created the state like the staging environment for, Google Tag Manager.
Yeah, it's because all the it's like. Yeah, like this is, you know, you have like everyone's working so hard to prevent these things from happening on the engineering side of things. And then marketing goes along and installs some random plug in and it breaks everything, you know?
So it's we need to work it into our processes too.

**Stace | 04:22**
Well, we are. It's the other way around. We have to put our process into them, and they need to own it, and they may even need to own driving some of the cleanup. I know we're always going to end up with some responsibility here, but that's part of this distributed system model going forward.
I mean, the vision is IT in general, as a department, is here to support what the rest of the business needs and application development needs to be focused on forward feature development in advance in the company, not running the day-to-day.
So when we get to things like Recurly and Genesis and those types of things, I do want the departments to own them, but they need to own QA. So we can teach them, but we don't want a phone call every time they want to configure a marketing campaign or a plug-in.

**bethany.duffy@llsa.com | 05:16**
Right? Yeah, they just need a lower environment in QA and know what to look for.

**harry.dennen@llsa.com | 05:20**
Right?

**greg.christie@llsa.com | 05:21**
Yeah.

**bethany.duffy@llsa.com | 05:22**
Like they did.

**Stace | 05:23**
A checklist and stuff to test for every time they had a coupon or something like that. Then I think that's good. But yeah, there is... I think you nailed the change management, right? There probably has to be some sort of handoff and us reiterating these things to them.
I do want to empower the departments to control as much as they can.

**bethany.duffy@llsa.com | 05:46**
Yes, I agree with that. Even just some visibility because I went after shopify if I first because I was like, "You have an outage that you guys haven't told anybody about." Then, as we were digging into some of the orders that we were seeing different tags and metadata that was being created by the plugin.

**Stace | 06:03**
Yeah, that could even mean our teams release channel and things like that. If they're going to configure and add new things or change stuff in Shopify, maybe there's no reason why they shouldn't have to post that publicly so it's visible to us or anyone else that's looking.

**bethany.duffy@llsa.com | 06:25**
Greg and Ray, I think this is something we can chat about in our product team meeting.

**greg.christie@llsa.com | 06:29**
Yeah.

**Jennifer | 06:32**
So I'll take over then. I guess we can get started. Wes, do you want to share your update?

**Wesley Donaldson | 06:41**
Absolutely, share my board. Okay, so top down then right to left. So top down. Ray, we are ready to kick off that additional 2000-ish resends or reprocessing for you. If we assume that's still going to be Wednesday morning, Mihal is going to take a pause just to make sure there are no new events or anything, just to make sure we're ready for Wednesday morning.
No blockers, no nothing stopping us from moving forward on that, unless you want us to kick it off a little bit early. As far as additional things, I'm going to skip the SRE track. Maybe we can come back to that last.
Things that are available, ready for review from the product side or ready for or in production ready for review. We have a few things that were from the refactor effort around the MVP, so things like the 15-minute window, which you all of us once again raised the concern that the existing Graph API gateway is still not honoring that 15 minutes.
So I believe we'd say that that's a concern that we're going to do with our DBAs just flagging that that's going to... Can that will absolutely be a problem? We go to production unless they have made that change.
But that's ready for us to review as a team. We have about four items. These are smaller items. These again, is just visual mostly visual and minor, functional issues from the MVP that we're looking for Beth and team to review, and we have already connected with Beth that we're going to do that in today's office hour session. Antony has moved the Emmett pattern. Just thinking of how we're going to instrument Emmett within this within our larger mono repo within the Thrive Commerce MCCARLY commerce.
So we were supposed to do that as part of today's architecture session, so we'll just move that conversation to the next meeting for this week. He's done with that effort. Thankfully, that has been a little bit delayed, but he's done with that effort and he's ready to share that with the team. As well as more importantly, that is reflected in the current architecture pattern that was discussed on Friday and in previous meetings.
So no concerns, no significant concerns there. Speaking specifically to the recurrly implementation, we have to take two epics that we're actively working on. From those two epics, we have some spike work that's been flagged as completed, but we have... This is just waiting for some review based on feedback from Antonio and a concern that you and we had flagged around why are we creating a new stack?
So that has been resolved. Just getting a review on this, and then we should be able to move the CDK ticket into "Ready for production" or effectively done. And Tony completed again for 1.1. He completed the blue-green environment switch.
So that's... He started deploying that yesterday, I believe, and he's done with deployment today or this morning. So that should be completed as well. Other things relative to the 1.1, I think the big concern that we have is just a lot of internal conversations around our implementation plan. To clarify, that's not saying anything about architecture needs to be revisited.
I think the team is finally of the mind now that they're clear in the architecture. It's just little details of the specifics of how... So generally, the team feels confident that they now have that clarity, and they're working through implementation.
So to that end, Antonio is taking on the Lambda for the ACL, and Lance is taking on the LLaMA for taking in the webhook and just being able to process that and push to a Dall-E push to the message queue as needed.
So those are progressing well. That's this ticket and this ticket. There are a few things that I've asked the team to deprioritize, most notably there's some refactor work. I've asked them to effectively just timebox that and put it on hold in favor of getting everyone... All team members that are planned on the recurring work.
So I may have to drag something like 640 back from in process to paused or blocked in the short term. There was a decent amount of conversation around... So the first epic was getting information in, the second epic was taking that information from current and handing it off into CSTAR via that order DT so good conversation around that. I connected, and there's an active thread going on about how we're documenting that.
So there's good information if on the challenge that we're seeing some analysis on how we actually should go about doing the hydration as well as how to do the actual mapping. I authored some of this, but the team is actively going through and contributing to it.
So I think we've gotten to... In my conversations with Lance and Jeremy, we've gotten to a good. We understand what needs to be done now, and now we're in a place where we can start implementing it. So I think more conversation than was expected happened this week.
Realistically, implementation is really getting on in earnest today and tomorrow. I can go over some of the SRSRE things, but I think most of those are in good standing, and they're significantly less important relative to just the recurring work. I can spend some time on that if we want.

**Jennifer | 11:57**
No worries, that's awesome. Thank you, and thank you for handling some of the time boxing and everything so that we can get people onto the recurringly. Harry.

**harry.dennen@llsa.com | 12:26**
So we've been dealing with the Shopify webbook issue. There appear to be two issues. One's around the P2P product that people can buy. It's not set up correctly, so we have a number of them coming from that. The other one is we are randomly not receiving last names on the customer objects.
So work around is to just use the last name from the billing that appears to be more consistent. That is trying to go live now. But we have another issue around a DNS for e-commerce on a leg swap. So either we get...
I think Francis is currently working on that. If we get the DNS quickly, we'll just go forward. If not, then we revert the e-commerce stuff and then redeploy. We have front-end issues. Heart risk assessment, part of this actually, is a different one. This is just visual changes. There's another issue where we're getting strange results from the lab, so busy fixing that. PJ is dealing with another urgent issue, and then he will move on to some of the work that needs to be done for core or to prepare us for that. Stefan is busy.
So this is going to sit in progress. It's going to look like it's a while. I have had him break these into the individual pieces, so he's busy getting test coverage for the admin portal, and we'll see he's moving across. The last name fix is currently ready for product deployment issues, so it's not out yet. We did have on the 13th when the PDF stopped being generated and it was the node update that did in fact break a dependency of Chromium.
That's usually something weird like that. So I shipped the update yesterday. New Chromium appears to be working, and it's just chewing through the VLK out, which should be done today for that.

**Jennifer | 14:35**
DLQ, what does reprocessing the PDF events do? What's the side effect of those PDF events?

**harry.dennen@llsa.com | 14:43**
Now, so when there's a PDF generated event, the mailer picks it up and checks if it needs to mail, and then it will be able to just log that it was a mail event. We don't currently use these.

**Jennifer | 14:58**
Okay, so where does the spelling that log?

**bethany.duffy@llsa.com | 15:08**
Okay, thanks.

**harry.dennen@llsa.com | 15:11**
The internal gateway is still blocked. We did get... Where we have the custom domain again assumed with Francis to be unblocked and what it is we can ship the new gateway for the admin portal and then going forward we should be cleared up to take on MMA membership and the status management stuff, which we're aiming to complete. The critical bits this week, but everything by mid-next week, that's everything Danes got. The stability step is in and shipped. The last one is the Commino account stuff, but he has been tied up with production issues.
That's everything.

**Jennifer | 16:02**
Tied up with production issues yesterday.

**harry.dennen@llsa.com | 16:08**
Yesterday.

**Jennifer | 16:08**
No.

**harry.dennen@llsa.com | 16:09**
Just last week. Last week is what I'm referring to. That's why those are still sitting there.

**Jennifer | 16:16**
Makes sense. There's a new issue that just came in, that I'm creating right now for Iterable is still getting the wrong names. Right now, there are a bunch of names that have participant ID instead of name and some other weird cases.
So, we're... I'm going to create something so that someone can take a better look at that and clean it up. Just make sure every call to Iterable is clean. So that's coming in ASAP. As it is, it's causing duplicate users in Iterable.
Another thing was in Harry and I mentioned this in the end-of-week stand-up. But if we have anything going on to the blue-green leg that is high priority or something that we need to get out, for example, this shop of IFIX, I'd really like us to be posting and communicating with the whole team that something is going out. Or if we have something that's a big change like the blue-green or let's say no JS or anything that's a big change that the whole team needs to know about, I'd like that to be posted just to make sure we're communicating.
To use the general channel, anytime we put anything that's not trivial on that blue-green, I don't mind if there's trivial stuff too, honestly, but at least the big things I really want to see being communicated about so that we don't run into situations where we're blocking each other.
Okay, awesome. Anything else? Cath, Ray, Greg?

**bethany.duffy@llsa.com | 18:25**
No, just if there's anything time-sensitive that you needed me for, just let me know. My inbox is a mess, so just surface it through...

**Jennifer | 18:36**
Okay, for the recurring meeting today, do we want to just keep that to a small group like Wes maybe? I know that you mentioned it.

**Wesley Donaldson | 18:50**
Yeah. So, Jennifer, if you don't mind, I'd like to have a few more folks attend that week.

**Jennifer | 18:53**
Else rather than sending everyone to the meeting to kind of keep the amount of people in meetings down.

**Wesley Donaldson | 19:00**
I normally I would agree. I think my only asks there are a bit of... I don't want to waste cycles in getting up to speed and asking the same question multiple times.
So I'd almost rather ask engineers to come to the call, put themselves on mute, listen in, and hear what's going on. You should be able to work in the background while your secondary process is running. There are team members that I think are mandatory on that.
I think Lance in Germany. Wow. Lance and Germany should be a part of that conversation just because they're both actively working on tickets that relate to those and myself. I asked to join simply for my own edification to see...
But I'm happy to not join if you feel strongly about that. I can commit to just joining and being very much a fly on the wall.

**Jennifer | 19:49**
Now, if it's very relevant, I think that makes sense, especially if people have those questions for them.

**Wesley Donaldson | 19:57**
Yeah, I don't expect Jeff to have a question, but I think the worry that I have is that I want to make sure team members are cross-pollinating between focus areas.
Jeff, I think he's since he's at the CD level, I'd love to get and just have a little bit of knowledge on what the order processing level looks like as well. That's a lot of words to say if you feel strongly. I could remove folks, but if I had to say...
Please make sure... Jeremy and through there.

**Jennifer | 20:29**
Do you have anything else for the product office hours? Do we have demos?

**harry.dennen@llsa.com | 20:44**
With one small product and fix this... I believe.

**Speaker 7 | 20:50**
Yeah, Fiman's going to show how the test did not perform. It should be now removed.

**Jennifer | 20:58**
Okay. Where are you guys?

**Wesley Donaldson | 21:00**
Your of us is going to represent the MPP refactor tickets about five of them, but...

**Jennifer | 21:10**
Awesome. Are you guys on the next one?

