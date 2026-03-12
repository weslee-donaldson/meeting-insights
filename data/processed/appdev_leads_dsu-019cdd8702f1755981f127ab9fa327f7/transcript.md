# AppDev Leads DSU - Mar, 11

# Transcript
**Jennifer | 00:04**
No, there's less. Hey, good morning, I was just about to share.

**Wesley Donaldson | 00:07**
A apologies, folks. Morning.

**Jennifer | 00:15**
Okay, so as far as our the Endor team's progress, there's a couple of things still in review. They had comments. Maybe yesterday. This one had comments from Harry, but Jane's going to take it to a wider team conversation around how we should be handling these specific exceptions and all variables, so that's coming. Just a general channel chat near you. Some of the other tickets, I think. For no JS I think, I'm gonna reach out to yo Elvis and see if he can look over that before we get that in. 
But it's almost ready. I know you all of us had looked at it one time and asked, Frman to go up to the most recent 24. AS so, he did that change already and so now it's back in review so that I will be talking to you of us about reviewing. 
And then we're finishing up the admin portal tasks almost they're getting through the process. And then the next things that the teams picked up, these are all subtasks, so we can ignore those. And then this is a legacy support ticket. 
But then the next tasks that the team is going to be picking up. Ray said to pick up the admin portal, but this one because it's been in here for a while. A GRAPHQL fix for the schema. And then we will be starting on state status management at that point when this third ticket here. 
And then that's when we will be doing these. I don't think they're going to be too long. So we'll see.

**Speaker 3 | 02:30**
I think it was one ticket that was no bigger, but the team looked at it yesterday and they should be able to break it down even further. Most of them should be 3. From 7705 to 7709.

**Jennifer | 02:47**
Okay, I don't think I ever seen that one, so yeah, I don't I'll look at the story points, but yeah, and I'll get the timing on the timeline today. Other than that, it looks like the backlog is done. After that, we've got still got the white screen, but Ray, I think that was just your issue, right?

**Speaker 3 | 03:10**
Yeah. I used a P3 ticket. And I probably the next step would be. I'm gonna reach out to a few internal users like rag bath like, see if we can duplicate in some other accounts, and if not, we can just close it, which just happened. 
Okay, no issue.

**Jennifer | 03:34**
Okay. From the engineering side, in order to fill this backlog after or like over the next few days, as I mentioned, I'm going to be going through the errors. I started going through some of them yesterday, and I've already identified some of the things that definitely need to be done. 
So I'll be creating tickets. I have a big block of time this afternoon that I can start creating those tickets, so.

**Speaker 3 | 03:57**
Yep.

**Jennifer | 03:58**
And then I'll be filling this.

**Speaker 3 | 04:00**
The next, priority would be the multiple screening. So after our own refinement on the lead level, we should be ready to go for the team level on Thursday.

**Jennifer | 04:16**
Perfect. Okay. That's it for end door. Any questions? West. Is youinishure?

**Wesley Donaldson | 04:35**
All right, yes, I do. Good morning, everyone. So jumping in, we're making really good progress in just closing out the MVP Epic team members have kind of have multiple things in review that a few that have actually been moved into done. 
So good progress overall. And the refactor epic, there are still a few things, a few defects that are still outstanding, a few things that we've actually identified, one from yesterday's architecture meeting. 
So that is a priority item. So that still is. It will be one that I'm pushing to get into completion for this week. But generally speaking, making good progress. Looking at additional work that we have targeted for this week's effort starting this week specifically around Reck Curly, the ingestion flow. 
So all those tickets are documented out. One has already been pulled into progress and FFCO is working through getting all of the CD K work, so that's going to be the gateway and such. So he's already working through that. 
And Tonio's has Jennifer. He reached out to you, I believe, asking for some help in connecting to it. TI. Reminded him that he doesn't need to go through you, only he should basically inform you. But we can open our own it tickets. 
But he did already reach out specifically looking for support on how to set up the DNS entry to make sure that when we actually switch over to blue green for the e com store, it doesn't impact the rest of the engineering team. He is a little delayed. Full transparency on this in network. 
I've asked him to prioritize getting this to completion with Sam based on the conversation that we had yesterday. So he's clear on that. This doesn't block us currently like everything we're doing as part of ingestion, this is not blocking, this is more on after the information the events are in current how are we handling them? What design patterns? What patterns are we using to actually access and use the information? 
But this one is definitely, I'd consider stale. At this point, I'm not gonna go through all.

**Jennifer | 06:41**
I created that ticket for Francis to help. Like coordinate that.

**Wesley Donaldson | 06:49**
Okay, if you can maybe just link it to 07:14 please or just make it as far as the P1 work that we have in progress that me how is still working on resolving the errors that were driven by the blue green like switch issue that we had last week.

**Jennifer | 06:53**
Yes.

**Wesley Donaldson | 07:07**
So he's now believes that he should be able to close it's instead it being 40000 events. It's now closer to 2000 based on the refinements. Thank you, Jennifer. That you guys were able to work out yesterday. 
So he feels pretty confident that he will have this completed today. Yesterday was kind of the same status, but yesterday was really focused more around calling down those events and updating the scripts that he had to be able to run a targeted set. 
So feeling confidence will be closed out. Today he was able to make good progress. And I think, another critical priority for me, this idea of how are we democratizing to use an overphrased, overused word, how are we democratizing the ability for team members to be able to more proactively address issues in the system? 
So we have a draft of this. The team is you, Elvis and Jeremy specifically are being tasked with removing. We're reviewing this. I took a review this morning. Looked really good. And the plan for this is to use the next couple of days to test out that playbook and get team members. I'm specifically targeting Jeremy for the first run to actually be the person to actually run through all of the tests. Review all the dashboards and be able to communicate back to the larger team of here's where things are. My inspect my goal here is that every engineer will know how to use this playbook and we'll be comfortable doing kind of what me how does being able to dive in deep on what events are happening. 
So good progress on that. It's in review now. We expect to have it completed this week, and we expect to have the first engineer doing the programed review starting next week. So as part of his kind of building out this document, he identified a couple of other issues, a couple of the dead. Q that were not being reported on. 
So I'm kind of tackling that first thing because we perceive that as critical as well. He reached out to you, Jennifer, I saw you responded back. But just be aware these are some of the things that he identified as part of his research. 
So we're creating a tick we already have a ticket. We're creating alerts for these right now and expect to have that by a PR for that by end of day to the worst case early tomorrow. Other effort around that reliability epic or reliability effort is just kind of what we had a great conversation last week and we kind of came up with an approach that there's still question of Stas expressed those similar concern yesterday. 
So this epic is not about making that emitter, that new dashboard, it's more about trueing up the idea that do we really need this, what do we currently have? How is it being used? So that's what this effort represents. 
So that's the critical work status of and what the team is currently working on. I can quickly touch on the next epics if we want. Or we can pause here.

**Stace | 09:44**
I think it's a good update. The one thing that, a couple of simple things like DNS there the request should not be how can I do it? And again, we brought this up. But it's really important to synchronize with and use the other teams to our advantage, right? Software engineers really just need to be writing application code, right? The cloud ops team exists to handle DN as to handle cloud networking to ultimately there our response knock right. 
So they should be educated on alerting. Once we have, you know, observability and monitoring set up, they can adjust the thresholds, they can be sure people respond right. So again, aligned with those teams. Don't. 
Because now if you just ask how I can I do DNS, they're going to e mail me saying what's going on?

**Wesley Donaldson | 10:37**
Yeah, just to clarify, like my ask to him is you should be able to open the request.

**Stace | 10:37**
Why does this contract group want access to our primary DS?

**Wesley Donaldson | 10:44**
You shouldn't have to.

**Stace | 10:46**
Okay, no, that that's great, right?

**Wesley Donaldson | 10:47**
Okay, exactly.

**Stace | 10:47**
Explain what we need and they'll get it done for us, and you shouldn't have to worry about anything, ideally.

**Wesley Donaldson | 10:52**
Yeah, and we're partnering with Francis and with Daniel Young.

**Stace | 10:54**
Okay.

**Wesley Donaldson | 10:55**
This shouldn't be a problem. 
I will take a couple of minutes just to show you what the next scope of work is. We have good kind of detailing around it. Specifically, we have those three epics. Beth thank you. I was able to go through those. I did create some tickets underneath each one. I did pull in the coupon one because that was pretty straightforward. Jeremy's going to tackle that. The other two I expect to pull in as well. Just let's have a quick office hours meeting and I expect to pull them in today. The one that is a little bit more meaty is around the is around 1.2 the drive ingestion. 
So from the conversations that we had yesterday, was able to really add a lot more details, some clarity I was missing on this epic. And Tony and I are reviewing it today with the expectation of assigning team members prospective team members this afternoon into tomorrow. 
So expecting that once we cleared the CDK work on Epic 1.1 for recurrly, we should be able to tackle some of this work at a minimum. The con three worker for next week. And that is Mandalor. Status? Any questions?

**Jennifer | 12:07**
No, thank you for the clarity. 
Anything else? I have one topic, but I wanted to ask if anybody else had anything first. Okay. Yalvas had brought up with me that he was, concerned with the lack of, like, any, like, approvals and everything before going live to production.

**Wesley Donaldson | 12:26**
[Laughter].

**Jennifer | 12:40**
Now he's definitely on the team. 
That's not live in production. So I think that like I talked to him a little bit about like the fact that commerce is still not public. So that's a little bit different. But I did express to the indoor team today to do demos before they're merging to Maine, or at least before leg swaps to do demos in the office hours. 
And one of the things that Yo Elvis was kind of bringing up was. I know before we had like those three groups where we had dev, QA and product groups and we needed to have approvals from all of them. You all this is suggestion is kind of like a lesser blocking one than that. 
And it's having like one group of the leads like it would be the people in this meeting and anybody from this group could approve. So if it's a backend change, it would be something that, like Elvis or me or Harry would be reviewing whoever felt the most confident in that area. 
And if it's like a front end change or anything like that, it would be something that Beth, you or Ray, like, would kind of look at and approve before pushing it through.

**Wesley Donaldson | 13:55**
Like the question, Chaer. You like that? To do something that.

**Jennifer | 14:07**
On the PR so just bringing that up to have everyone think about, I don't know if there's any initial thoughts or if you guys wanted to chat about it more at a later time.

**Wesley Donaldson | 14:09**
Just bringing that up. To have a date. About it.

**greg.christie@llsa.com | 14:21**
My only initial thought. And I think actually there's a good working model for this right now with that team is from the point of view of like product review and approval. The most ideal thing would be just getting it onto like a test environment for us to be able to, you know, interact with, you know, then have a as you know, one. It doesn't seem to be a full sprint there, but having like some sort of cycle there that we can then review and get our like any like feedback or notes in.

**Stace | 14:54**
But that's I think that calls up a gap in the process. Greg because it is right. It's either available in PR environments for you guys have to have gone through or we have next which is the blue green deployment for someone to see it before going out. 
And I think that's one of the gaps here, right is we put substantial time into building blue green and next he is loading next face. Just hit [Laughter] it and get switched live. [Laughter].

**bethany.duffy@llsa.com | 15:24**
That's what I was going to say too. I don't want to be improving PRs inside of git. I would like to do the lower level validation like we've been doing through demos. And then when everything looks good, they're pushing it to the next leg. We're looking at it again and then deciding when to release it based on all of the other things we have to coordinate, right?

**Wesley Donaldson | 15:44**
If we. To.

**bethany.duffy@llsa.com | 15:47**
So I may need to hold it for a week because I need to make sure Asa gets all the materials to the her team. So that's really what my expectation is.

**Stace | 15:56**
Okay, well, there is. And we can do feature flagging, but there is the gotcha and next is holding it backs everything else up unless we merge which we could merge other things in the next, right? So essentially releasing multiple things when you do the leg. 
So that's possible, but there's a little overhead and builds and merges. But. So it would be one of those things where we would want to approve next, you know, within hours or within a day, depending. 
Yeah.

**Jennifer | 16:28**
Or call it out ahead of time. If we're going to hold something like we should know that we're going to hold something when the ticket comes into progress.

**bethany.duffy@llsa.com | 16:37**
Yeah, we should know. Depend. Yeah.

**Stace | 16:40**
And then there's feature flags we can begin to use to right where if we don't, things aren't going to be ready or we don't want them to be visible for a while. You can review what's on next. Turn it off. Switch.

**Jennifer | 16:54**
So, Wes, I think that one of the things that Elvis was seeing was and I say that it's probably just the fact that we had a deadline and that people were trying to get stuff out. But what he was seeing was people were pushing stuff out and then, like, tiny defects were getting through.

**Wesley Donaldson | 17:06**
Name for his people.

**Jennifer | 17:12**
That would have been found if someone that was reviewing pulled up the PR and opened it and looked at it. 
That's another thing that I brought up in Endor today.

**Wesley Donaldson | 17:21**
Big question and I'm saying you know what they get more said and then what is like you vio answer to be so I'm hoping that the team can start to push like if you're reviewing a opinion as a procution.

**Jennifer | 17:22**
Like, there was one ticket where I said, this one seems like whoever's reviewing it should be pulling it up in the PR so like, I'm hoping that the teams can start to push. 
Like if you're reviewing a ticket as a developer, you shouldn't just be looking at the code, you should be making sure like you're reviewing it, you're testing it, you're doing that for it. 
So that way we're not getting the extra cycles of defects. 
Yeah, it's a balance right now, especially since the commerce one isn't live.

**Wesley Donaldson | 17:56**
Yeah, you're I mean you're absolutely right. I think it's very much the obvious of folks pushing really hard to get into demo, but from a process perspective, I agreed with that and we'll enforce that. 
Yeah. Now. Especially since the.

**Jennifer | 18:17**
It's definitely like the like a balance of what makes sense to get things out versus make it where we're not having extra defect cycles. 
So I think like some of the bigger ones probably push that on. And if we're, like, seeing, like, certain people, like. Like, let's get this one reviewed. Let's open it up. I mean, I don't. I think it's a great practice personally, so trying to push it as much as we can. 
Okay. Anything else from anyone? Thanks. Have a great day.

