# AppDev Leads DSU - Mar, 26

# Transcript
**Jennifer | 01:17**
What do you? Gu.

**Wesley Donaldson | 01:19**
Morning. Good morning.

**Jennifer | 01:51**
Okay. Who wants to get us started today?

**harry.dennen@llsa.com | 01:57**
Go.
That group actually is the other one.
Okay, this person appears to be fine. I'm not sure what's going on there. Ferman is waiting on some feedback. I think this is around first names going to Iterable and that's a pretty straightforward thing, just adding it, making sure there was one specific case where it didn't end up there. Sons found it.
I'll be in today. The P zero with the Shopify orders. I don't have a phone number, so Nick ran the manual intervention yesterday, added the phone numbers we got on the Excel spreadsheets and got those people in. There's now over 100 on the back in there.
So the problem's not gone. I had a huntown of what Noel would mean for us. It's okay. In the DV, there is an accidental reason that e-com will stop a kill from going it throws an error because of a string replace.
So what we're going to do is if we get a null, we'll turn it into an empty string and then pass it along. That'll be fine. Nick's going to take care of that once he gets to this next manual intervention.

**bethany.duffy@llsa.com | 03:35**
Okay, couple of questions on that. Well, you just answered my first question, which was when we were going to do that? My next question is Jennifer ICCD on it. I have another spreadsheet from customer support. Do you want me to add it to that same bridge?

**harry.dennen@llsa.com | 03:49**
Please? Yes. Yeah, he's gonna need all that stuff too, because it's a manual thing, right? He's going to pull those objects at the phone numbers and re run them. I mean, obviously, if we had the phone numbers, it would be, you know, we want to use them. It sounds interesting. It seems a bit interesting to me that we're getting these phone numbers at a CTAR, right?
So, like, I think it may not actually matter. Like, if you send it in with nothing, it's not going to change it in CSTAR, but I don't like, I'm not sure.

**bethany.duffy@llsa.com | 04:14**
Yeah, I don't know if it would match it or not.

**harry.dennen@llsa.com | 04:17**
Yeah, so, yeah, a lot. I found a lot of interesting things we could fix in ECOM, so I just don't really want to touch it. The alerts firm was just a little confused about what the limits should be, but we said, "Just guess we can adjust later," so that'll go in today. The blocked ones are incomplete. A resolution after 28 days. This is actually blocked.
Okay, so this is a question around how we do cancelations or derived cancelation as then we found some data and so we're going to market as canceled. This depends on the work that Dane's doing of getting the individual product statuses up into Thrive, which is on its way. One partisan review. This is the discussion we had yesterday about whether we want to do some distilling of those statuses or do we just want to pass them through straight through?
So he is passing them straight through right now. It looks like it's going to be strings.

**Speaker 5 | 05:28**
The...

**harry.dennen@llsa.com | 05:28**
No, it's still an update on this gateway, I think because they have a workaround. It's not a priority anymore, so it's probably going to sit here for a while. Francis did check with Dane yesterday, but we'll check again today. Shipped the cancellation after 24 hours this morning and we've got some... We do have the alert on unexpected errors for the membership stats and this...
So the rule set is over on the colonoscopy stuff. It's going to go live today. We'll see that and ready for PRAC so that's good. That's fun. Going the testing for admin portal, Stepan's got all that in now. He's still moving forward on the different demo user templates that we've got. He's having a struggle learning to help them on the... There's getting an environment issue. Other than that, yeah, mainly it is the product statuses going in so that we can unlock the rest of it.
Then the ones that depended on the statuses I had before. I can go back to that now. I'm not dealing with the P. Zero. I think that's everything. We have this one individual person with a missing first name, which I think we can chat about after what we want to do with them.
That's it. Other block one is blocked by Dan's work here, which you're going to today. That's everything.

**Wesley Donaldson | 06:59**
All right.

**Jennifer | 07:00**
So for the question that you had about Ferman and the alert... What's in the ticket because I can't remember... Not much.

**harry.dennen@llsa.com | 07:10**
Right. So he was... So we said too many and too few. I think his question is, what is too many and too few? So we said zero and 500, so we'll try that.

**Jennifer | 07:17**
Do they have anomaly detection yet on the ad?

**harry.dennen@llsa.com | 07:24**
There's no pattern, there's no... You can't find no pattern to follow. That's how the conclusion started.

**Jennifer | 07:30**
Okay, so is that something now and then we'll tweak it later?

**harry.dennen@llsa.com | 07:33**
Exactly. Let's just do something.

**Jennifer | 07:38**
Sounds good. Thank you. And then and when you were saying, like you were you've been focused on the P zero with Nick, you said yes.

**harry.dennen@llsa.com | 07:51**
While he's doing the manual intervention, I was looking into validating the noability and what was actually going on and if it was safe, what was safe for us to send from Thrive. So we know that now.
So now he's going to go do that work. Okay, thank you. And then. Right? I mean, we can shut down. Actually. Let. Where's? Go.

**Wesley Donaldson | 08:21**
Thank you. Jumping in, just a cover off on some things that went to production between yesterday and today. So we already mentioned that we closed out this CDK for production. I would say there's still a small bit of configuration work around this. Francis and IFCODE got to a good place here.
But I think there's a small thing on the edges, for example, switching out booking that lifeline screening to be the main domain that we're actively using now. I think the team is still using tech commerce, so a small bit of configuration still needed to be done to truly close that out. We had a couple smaller items around or items around just the SE track. Specifically, we had a few deer queues that we created additional alerts for, part of the larger alert conversation. Jennifer, for sure, that we created additional alerts for some DS that didn't have any.
So that as well as the code. SE we've done a... Based off the last blue-green issue that we had, we've done a comprehensive code sweep just to verify that there wasn't in any of our build, anything in our build pipelines that were incorrectly addressing how we're pulling in what stack is live.
So all those tickets we were able to move to those tickets and similar tickets related to just clean up around the process in the track. We were able to move the done to yesterday and today things that are ready for production or things that are close to being completed. The production... This is the coupon entry. Specifically, the ability to manually input a coupon into the URUI flow.
So FFCO was paired with us on this. He had a couple of refinements items he had to fix from that conversation, so he's pulled that back and still working through that. He's working in parallel on the cart UI. The cart UI is similar to... Not similar, but it's related to the idea of how we are pushing and coupons, how we're managing coupons in the UI. Xolv is taking on the critical portion of how we actually send that over to Recurly as part of the membership discount.
So that actually is in review, being reviewed. There was one confirmation. It sounds like we needed... I think... You already gave this direction, but I just want to double-check this idea of the unit amount should be set to zero when we're sending it over as part of the membership discount. I think that's correct on my... I'm conflating things here in the per-line item along the hard-coded... Sorry, hard-coded to $30.

**bethany.duffy@llsa.com | 10:44**
The unit amount should be set to zero.

**Wesley Donaldson | 10:58**
Conflating things. You're all good. My... We had some additional visual discrepancy. He's done a couple of walkthroughs for the product teams. I'm giving him a final review. I'm giving him a review, but Devon has taken a pass at doing a review of all of these just so we can close out this small UI revision effort specifically around the architecture. We have a couple of things that made really good progress on.
So Lance and Jeremy made really good progress in their work from Jeremy's end. Just to ground us, that refers to our ability to actually take the e-com three API, our ability to take information coming out of the event store, getting it through the event bridge, and pushing it on to CTAR and into the SharePoint for failed orders or error orders.
So he's completed the implementation that he's received an initial review from Lance. He's completed all those items. He's actually now testing end-to-end from getting information through the event grid and pushing information into the spreadsheet as well as into CTAR, so that looks good.
That is not going to be able to be flagged as complete until we have all of the downstream work completed. That we can get a live order all the way through right now. Lance has completed the build out of this environment.
From a dev perspective, we're not doing blue-green here. So just one environment for the processor to take all of the reactors. He is in good standing on that. Antonio has the work that generates the data that pushes it into his work stream.
So Antonio has this into review right now. The team is aware that we need to swarm around the review, so they're actively getting him a review on this. Once this is complete then he will be able to confirm the inventor information coming in and be able to move his task into green.
So core thing there... All the things that we needed on the event grid. Compliments to Francis and Lance. Really pushing that through. All the things that we need on the event grid portion is complete or in review or close to pushed into production.
So we're in good standing on that track. Antonio had shared a critical piece of work around how we're doing the single-it process. So that work, as I mentioned, is in review. He completed and that work is comprehensive towards how we're getting information out of the event store and pushing that downstream for BI consumption as well as for consumption by CSTAR so that is now in review.
I've asked the team to prioritize getting reviews on that because the team goal is still targeting being feature complete by U18 end-to-end for tomorrow by end of date tomorrow. So the team still feels confident we're tracking towards that, but I would say there's still a few things around the edges that we're identifying. Nothing critical as a major feature development, but smaller things.
For example, the configuration of booking as the is getting rid of the temp commerce domain and focusing on booking that lifeline screening. So little things like that are coming up around the edges, but the team is actively identifying and resolving them. A few features that we've made progress on as well. We know that we have from the product team the chat tracking as well as the discounts. I spoke of discounts already for help. We're blocked on that. Beth is aware we're pushing forward with ROP to be on block from that. The tracking. We're actually looking really good here.
That's in review. We don't think we need... The production code we... But since that's going to be done via a GitHub variable, it's not a blocker for us to be able to push this forward and then just update the variable for production state. Things that are a bit of paused or read need additional investigation or work. We actually pulled back the work around reducing the amount of data that we have inside of the hard drive storage around current DB for the dev instance. TL;DR on this one more complicated than we originally thought. Paired with Sam this morning. Me, myself, and Sam suggested an approach that might give us that. Me... How's going to do an investigation on this over the weekend and come back on Monday with a perspective on if we can close this ticket off faster. Reminder we did upgrade to 60GB on this storage.
So this is not going to be a blocker in the short term, but something we want to address. We had a great conversation with Jennifer and Frances... Miha myself this morning around alerting. So there's a stream of work where... How is going to tackle next specifically around just removing some of the alerts, not removing addressing some of the false positive alerts that we're seeing.
So we're going to tackle that. That's going to be the next ST of work that he tackles other than just getting through the task that he has in supporting the team and getting through getting everything into production.
I'll pause here. This is a good place to talk holistically. Any questions or concerns from what I shared?

**Jennifer | 16:12**
I. If you talked about it, I missed it. But did you talk about the blue-green issues that you guys might be facing?

**Wesley Donaldson | 16:21**
So there is one blue-green. I did not speak about it in detail, but there's one ticket that you, Elvis, have. Elvis has a ticket that's related to the entry point of the application. Specifically, you should be able to hit forward slash appointment, he believes.
I think he may have stepped back a little from that because it... Based on his last feedback this morning, it sounded like it was more of an application routing issue than an environment issue. But he's pairing with Francis to investigate further.
But it's not definitively a blue-green issue. There's additional investigation that he's doing with Francis.

**Jennifer | 16:55**
Okay, sounds good. Yeah, let us know. Then Harry, you guys were working through some issues that were blocking things yesterday. Did that all get resolved?
Ping... There might have been an issue with leg swaps, leg switches.
Harry, I think you're... If you're talking...

**Sam Hatoum | 17:36**
Yes.

**harry.dennen@llsa.com | 17:39**
The only one I can think of was earlier, we discovered that when the smoke tests are run on a deploy after a main merge, they're not tested on the branch they were deployed to. They're tested against the active branch.
Okay, so, I mean, I don't think it blocks anything, but it's surprising behavior and won't catch issues at merge. Okay, thank you.

**Wesley Donaldson | 18:23**
All I... That you just got a little more in detail on that.

**bethany.duffy@llsa.com | 18:32**
Do we have anything we need to go over in the app office hours?

**Speaker 5 | 18:44**
I don't think so. The big questions are done, but I don't think that's... What do you call it? Demo-like items for them all?

**harry.dennen@llsa.com | 18:56**
Yeah, I don't think so.

**Speaker 5 | 18:58**
Okay, we do have one car.

**Stace | 18:59**
It's gonna go out this week.

**Speaker 5 | 19:01**
It's going out today.

**Stace | 19:03**
Yeah.

**Speaker 5 | 19:03**
All right. Yeah, I've been in touch with Tom Nixon and Michael. Tom Nixon did one yesterday with Michael. Already on the tablet, we're releasing both the tablet and the pre-registration.
So as soon as it's going out, it's going out tonight or today at 4 PM Easton. Once that's out, they will let us know if there's anything else we need. But otherwise, I already let Brian prioritize the report ticket for the data team, so that'll be the next day.
Okay.

**Stace | 19:42**
Couple of things. West implementation update. Sounds like things are on track for everything. The challenge for you and Beth, though, is to get ahead of the current state. The business comes to us almost on a daily basis, right, with the legacy system asking how something works or why something doesn't work. Just because there's no documentation.
So I think now it's a chance to change that. This can't be a confluence because no one in the business can see confluence. But we should start to document because again, our goal here is to launch the store and then turn recurrently over to the stakeholders to run.
So I just threw a few things I thought of at the top of my head. But I think we should start some documentation so the business understands what the system does and we understand in the future what we did and what the system does without always having to go back to the code and look things up, right?
So we're doing a lot in local storage. Some things clear it, some things don't, some things repopulate when you come back, and some things don't. Let's get that documented somewhere. What have we done with tracking so far and how does it work? I don't even know this, but are we collecting the UTMs and putting them in the order yet, or do we start to do that? Appoint the library? There are some rules around that. There's a time that it lasts and it's supposed to unlock.
I think we should document that. Coupons, of course. Then what made me think of this was all the hard-coded stuff we're doing around membership because that's going to come back to bite us all the time if we don't explain that to the business, or we'll forget in three weeks, and something will happen.

**bethany.duffy@llsa.com | 21:24**
Yeah. I'll create a space in our product development SharePoint and start answering what I know. Then, Wesley, I will hand it off to you so you can help fill in some of the more technical stuff that I might not know.

**Wesley Donaldson | 21:39**
Perfect. I think at minimum I'll per. I think let's get a topic list in there so Stacey can speak into that and then we can enrich from there.

**Stace | 21:48**
Okay, yeah, this will just help us not only be our own reference but hand it off. I guess the future challenges are similar to read messages. How can we have AI update these sorts of things as we make changes?
But at least getting some set of documentation out there will be a huge step forward. The other thing is between dev or next, today or tomorrow. Can we start to send this out to some SLT members and be like, "Hey, go play around for Monday at the latest?"

**bethany.duffy@llsa.com | 22:21**
Are you expecting? Is it to go play around with the UI and tell us what you think? Or is it to go around and see if you can break the Star integration?

**Stace | 22:31**
Well, they won't really be able to see. Well, I guess some teams could go in and look for the orders and see Star. That would... We definitely wouldn't want them on prod per se there. I'm thinking more... Just go play around with the UI, see how it is us being able to show up even as we're going through U80 and things like that. "Hey, here it is. It exists, it's done. Provide feedback." That sort of thing. Got it right here in the habit of... Again, here.
Especially with blue-green and things like that. We have the ability to demo things pre-release. I think that'd be good to start to be able to do where we can.

**bethany.duffy@llsa.com | 23:17**
Should we do...? I don't think we have an office hour. Do we want to do a product office hour tomorrow with the group, and then we can send out the link and have them go play around with it?

**Stace | 23:36**
I think there'd probably be a good idea.

**Speaker 5 | 23:38**
Okay, we can do that.

**bethany.duffy@llsa.com | 23:39**
Awesome. So I'll do a quick download with all the updates. So that just means we probably need to make sure that any of you all these changes are in sandbox.

**Wesley Donaldson | 23:51**
Is that effort going to be focused more around the UI to the idea that it's fully integrated and there are stakeholders who are going to be comfortable looking beyond just the UI experience, I think. Monday... Yeah, okay, I think...

**bethany.duffy@llsa.com | 24:02**
I would say no.

**Wesley Donaldson | 24:05**
We're targeting... Probably we should be targeting Monday.

**Stace | 24:09**
Okay, that's fine. When whenever it's realistic and it's done right, I want to do it in a way that, especially if we let them play, they have confidence they're not going to run into problems.

**bethany.duffy@llsa.com | 24:18**
Yeah, I wanted to say...

**Stace | 24:19**
It's a good habit to do. You've all worked hard to stay on the timeline. Let's celebrate the win and let the company feel it too.

**bethany.duffy@llsa.com | 24:28**
Yeah. Let me pull up... When I was pulling up the sandbox on my phone yesterday, you all said changes weren't in there. So I would like all of that in there before we do that demo.

**Wesley Donaldson | 24:40**
He has something in PR review. I'm giving him AI this afternoon, so I think he was holding until Devon or I had a chance to take a full walkthrough of it.

**Jennifer | 24:59**
Okay, a couple of one, so go ahead.

**Wesley Donaldson | 24:59**
One quick gen.

**Sam Hatoum | 25:05**
All right, I get the mic. Thank you. Just on your note about AI going through the code base and figuring out what changes and updating dogs, I actually already have something working on that for another project, so just let me know as soon as you want to play that card, and we'll get to it.
I have something that works pretty well. Actually, I think I already did it as a run, and I got some documentation for you previously. I showed them to you. So that same approach we've been evolving in a bit, and we can leverage that.

**Stace | 25:32**
Yeah, let's toy with that... Before I looked all this up, and Sunday too. Yeah, that might be... We punted a while back if we can get some of that working again. On trying to link it up to Copilot Studio, things like that.
Because then it could keep it updated either in SharePoint or... If we set up our own Copilot agent, then essentially we can just have a company-wide chat. If you have a question about the system, you just ask it, right?
It's going to give you the right answer. We can even give it access to GitHub. [Laughter].

**Jennifer | 26:07**
That'd be cool. Yeah.

**Sam Hatoum | 26:11**
Happy to do it. Since... Prioritize it, and I'm on it.

**Wesley Donaldson | 26:15**
Sorry, one quick point. We're doing a bit of a playbook on how to verify and how to go through the system. Beth, I suspect you probably already have something like this where Devon has shared. Devon and have shared a past effort from Shopify that feels more like a test case but seems like an opportunity for us just to say, "Here are the things that, from our ownership perspective, we want to make sure we're checking off."
So it's a quick checklist as a proof or end-to-end. Do we have something like that already? Thoughts on us creating that as a team?

**bethany.duffy@llsa.com | 26:49**
I thought Devon was putting that together. I asked him to do that last week.

**Wesley Donaldson | 26:53**
He did. He pushed it in. I'm not sure if it's the same thing, but he gave us... He uploaded to Confluence a test case that he TED off as part of verying shop advice. That's what you're referring to?

**bethany.duffy@llsa.com | 27:07**
Yeah, so it should be the same thing. There are just additional permutations of the order structure. Now, because we don't have individual diagnostics inside of Shopify and our membership, the way that we present membership is a little bit different, so that should all be very similar.

**Wesley Donaldson | 27:31**
Nice. So that's... You just hit it perfectly. That's exactly the kind of thing I was looking for to make sure that's in that document that we're contributing to.
So I'll take another pass at the document. But if you can... Specific ideas like that is what we're looking to make sure are in the document.

**bethany.duffy@llsa.com | 27:47**
Okay, I did give Devon a couple of different ones that I believe he already added, but we can review it to see if there's anything missing.

**Wesley Donaldson | 27:55**
Sounds good. Thank you.

**bethany.duffy@llsa.com | 28:00**
And that's for just like the full end to end in the lower environment, right?

**Wesley Donaldson | 28:05**
Yeslly.

**bethany.duffy@llsa.com | 28:07**
Okay, I have mine.

**Wesley Donaldson | 28:07**
You love to run that as part of PR as well, but it should be tested and verified as proven as part of the lower environment.

**bethany.duffy@llsa.com | 28:15**
Yeah, got it. I have my limited, most critical test scope for PRAD. Just because we can't run thirty different transactions in broad against our company cards. So I think I have eight scenarios that cover the different things that we want to check.

**Wesley Donaldson | 28:36**
Do you have that? I assume that's not in the document. Is that something we want to...?

**bethany.duffy@llsa.com | 28:39**
It is. It's in PRD 52. There's a Confluence attachment, and it has my production validation checklist in there.

**Wesley Donaldson | 28:50**
PRD 52? Perfect. Of course, you do. Thank you so much. Perfect.

**Jennifer | 29:01**
In addition to doing some, AI check over the code base to get what how the system works, we might want to have like Jira like I've been using the Jira AI and it's been pretty cool. And maybe it can go through like all of the tickets in PRD and like, what should like what are the requirements that we're asking the system to do?
And if it can like look through and maybe create test cases or something like that, might I be able to use Jira like that? Now?

**Wesley Donaldson | 29:37**
It looks bloring.

**bethany.duffy@llsa.com | 29:39**
It's a good idea. I tried doing that in Copilot, and it didn't play very nice.

**Jennifer | 29:45**
The Jira one. I've been playing around with it, and it's been getting better. I feel like... Then another thing I wanted to mention just for Harry and Wesley, for you guys, teams like you, all of us mentioned that... No, not many people are doing the PR environments now that it's manual, and that should be something that most of the PRs should be getting up on a PR environment, and we should be actually testing them and running them before merging them.
So I don't know if you guys can push your teams to make sure that they are testing their branches before we're doing merges more often than not.

**Wesley Donaldson | 30:34**
Do you think it's a concern of just lack? They're not aware that that's a requirement. Or is it just that they're choosing not to do it? Or not choosing at all?

**Jennifer | 30:43**
I'm not sure. Elvis just mentioned that he seems to be the only one who's been deploying to the PR environments. Now that we've made it a manual deploy.
So I want to make sure that we aren't... For now that it's a manual deploy because we were trying to save on resources that we aren't giving up on the protection of actually making sure that things can deploy before we try to merge it in.

**Sam Hatoum | 31:13**
I don't think the change of the... That the environments are no longer doing it is... Sorry that we're no longer automatically deploying doesn't mean that people were testing before.

**Jennifer | 31:27**
That is a great point. So I think this is just one of those when we're doing reviews, we should be running that per environment, we should be testing the code, making sure that things are working. Sometimes...

**harry.dennen@llsa.com | 31:43**
Yeah, I just wanted to jump in. We had to look through the PRs from... And there's plenty of stuff I think we can happily rely on our integration tests. We have a massive test suite, whereas we had some... Nick pushed one in that had a user had to be in a very specific state and we needed to see that working.
So that was... We used a PR environment. I think Wesley's point on CDK-related things and infrastructure-related things like that involve a deployment. Yeah, you probably want to use a peer environment.
I think we're still in the world where it's worth having a discussion upfront. Do you really need to go and watch it run when we have a very robust test suite on it?

**Sam Hatoum | 32:31**
Yeah, I was going to say this is, this sounds like a definitely a retro breakout. We should definitely talk about this. Lots of ideas on how to do it. I think there are options like making it a pull system.
So when it's doing a review with the product owner, then show it on a PR environment. Otherwise, there's no reason for things like that. Or selectively say where we are going to demo this at the beginning of a ticket.
You can decide actually we need to see this on a PR branch. Or no, we're on a PR environment. Or no, we're going to see this on green or blue on inactive legs. So I think we need to build a pull system that forces it, rather than just asking people to do it because I don't think anyone will do it if it doesn't seem valuable to them.

**Jennifer | 33:10**
That makes sense. Yeah. And that's kind of where we're getting to. If we're getting like. If. If we pulled off like and made it manual and now people aren't doing that testing, then we're going to need to make another change so that, yeah, we are making sure that people are doing the appropriate testing.
And I agree. Harry like it doesn't have to be every single thing, but we should make sure. I just want to make sure that we're working with the teams that we are targeting and we're testing when we're reviewing and we are making sure that we're making those choices.

**Stace | 33:51**
Yes, this is a great discussion. Even if it. Even if it starts as a retro with Mandalor and we should do some retros again because we've I know Jennifer already thinking about it because we've kind of been punting on them for velocity reasons for a while, but it is kind of indigral to the overall agile process and I think a healthy culture.
But on the culture thing, I think coming up with something around this and socialize it, maybe using part of like one of the Friday, like all engineering demos and having a discussion about this, you know, this should be standard across both teams. Be good to get everyone aligned and sounding off on it.
We can set some rules, but really to follow it, you've got to build this into our development culture.

**Jennifer | 34:42**
Yeah. Agreed. I will not be at the demo tomorrow, but if you guys wanted to have that discussion, that would be a great time. Yeah, if we can get a retro set up for each of the teams next week. I know that I've been saying it for the last couple of weeks and it's kept getting postponed, but I think next week we should target to get a retro for each of the teams. Sounds good.

**Wesley Donaldson | 35:13**
Sounds good.

**Jennifer | 35:15**
Sounds good. Thank you, guys. In the next show...

**Sam Hatoum | 35:23**
Yeah. All right. Thanks.

