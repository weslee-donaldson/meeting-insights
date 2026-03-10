# Mandalore DSU - Mar, 10

# Transcript
**jeremy.campeau@llsa.com | 01:29**
So he said Chipcare is not joining the stand up.

**Wesley Donaldson | 01:30**
They s. Yeah. Said he was unable to join. He gave me a status on 06:96.

**jeremy.campeau@llsa.com | 01:52**
You all this and they. Ha. A second.

**Wesley Donaldson | 01:57**
I'll pa them for you. 
Okay. We shouldll probably just get started.

**jeremy.campeau@llsa.com | 02:33**
I assume you guys can see my screen. Alright, go down the line then. Just go alphabetical. Devin, I know you didn't have a ton. I guessterday a lot of your stuff was in review, but was there anything I could call out beside?

**Speaker 3 | 02:59**
Good morning. Now, Beth and I spoke this morning about the defects I created. Just to make sure it wasn't anything I missed. But we're good there. And then for the defects that are being worked when they need tested. 
You know, I'm ready to review.

**jeremy.campeau@llsa.com | 03:19**
Okay, yeah, I see a lot of those have already been picked up, so sounds good. Jeremy, I know I have a IA you a review, but I want to run through.

**jeremy.campeau@llsa.com | 03:36**
Yes, yeah. So for that one, I'll just ping you one to review it. It looked like you. All this had some changes in his branch that are going to change some of the tests, and I noticed there were some that were failing for playwrights. 
So I'm waiting on that to actually, you know, get that one going. And then I don't have any blockers, so that's where I'm at.

**jeremy.campeau@llsa.com | 04:05**
Okay. Yeah, I think you said that one of mine that was in review might affect yours, so if you want to get that merged in.

**jeremy.campeau@llsa.com | 04:15**
That merged in. Already merged successfully. And I pulled in the changes on one of my branches, so yeah, your ticket I actually put it in done. So your tickets all set.

**jeremy.campeau@llsa.com | 04:29**
Thank you. S JFF care is not here, but he mentioned that he's working through one of their visual key.

**Wesley Donaldson | 04:40**
Yeah. He's got 6906. And he said he'll have a PR up for us today. Probably mid to early afternoon.

**Michal Kawka | 05:02**
So the parked events alerting was merged. Thank you. You have this for the review yesterday. I didn't get that, to it yet. I mean, it's merged, it's deployed, but I haven't tested it yet. I'm gonna do it after the stand up. 
Okay. I'm currently reading the document that I prepared about alerting. So basically the monitoring approach and rotation process. I'm gonna read it myself again to make sure that's nothing's missing, that the flow is right and all that stuff before I hand it over to the next person. 
I'll pick up a volunteer most likely, or I'll ask West to do it for me.

**Wesley Donaldson | 05:40**
Yes, please.

**Michal Kawka | 05:40**
In terms of the sorry, go ahead, sure.

**Wesley Donaldson | 05:43**
So I just said yes, please.

**Michal Kawka | 05:47**
In terms of the resolution, like I mentioned yesterday, the PDF mailer events were successfully played. I synced up with Jennifer today about the rest of the events. 
So. And there's about 40000 events that need to be replaced for the terrible bucket. We will be replaying those that are safe. So we sync up on the types and on the error messages which can be replayed. 
So I'm gonna be replaying them after the stand up. It's gonna take a few hours because that's a sinnc process. But eventually we'll drain. So it's in progress. But the next steps are clear.

**Wesley Donaldson | 06:28**
So sorry, hold on. So we're done with all the parked events. We have a build in for the parked events that you're reviewing relative to 6660, and then separately for the PDF or iterable events, which is 679. You're working through those today.

**jeremy.campeau@llsa.com | 06:44**
Correct.

**Wesley Donaldson | 06:45**
Okay, sorry.

**Michal Kawka | 06:52**
That is for my sight, thank you.

**jeremy.campeau@llsa.com | 06:59**
Did you ever stop one?

**Wesley Donaldson | 07:02**
Did.

**jeremy.campeau@llsa.com | 07:10**
No, obviously got a few things on yours. I know we had a discussion this morning. I don't want to hijack stand up, but you just want to give us your updates.

**Michal Kawka | 07:26**
Yeah, right now.

**Yoelvis | 07:27**
I am, working on the graphqer code generator. Is I adding some documentation in the remi and examples and been working on the proposal for the complete check out flow that is gonna be critical in these days. 
So, working on those areas.

**jeremy.campeau@llsa.com | 07:58**
Get not all go real quick. And then went back to some of the updates to the tickets that you mentioned. Wesley So this guy, the refactor works in accounting or. Curly this was more of a documentation ticket. We have discussed it. I'm not sure what we want to do with it. We want to just close it out, but keep it open so we have visibility. 
But there is a document attached. And I know we did discuss her yesterday. I guess. Wesley, would you prefer this stay in review for now or do you want to hi it off the board?

**Wesley Donaldson | 08:48**
I'd rather like if there's anything that we need to for clarity inside of architecture, let's just raise it there. But I'd love to get it off the board if it feels like this is the same concern. You all this is related to the concern around order ownership. 
Okay, let's just let's get it off the board. Who has? So you said you prayed with your Elvis on this. So he's aware of the kind of the findings there. We can reflect those in future epics.

**jeremy.campeau@llsa.com | 09:19**
Okay. Yeah. And then real quick on my side, just we discussed in the product office hours yesterday some of the updates to the map behavior. So I'm moving to that guy at the moment. 
And then you updated Wesley. A few tickets before stand up. 6 91.

**Wesley Donaldson | 09:49**
Yeah, I can touch on these really quickly, so no worries.

**jeremy.campeau@llsa.com | 09:51**
You wanted to speak to this?

**Wesley Donaldson | 09:54**
So from Refinement yesterday, we kind of, we took the tickets that we already had planned and we kind of broke them out into three core buckets or four core buckets. 
And the goal there was just chunkable pieces of work that engineers can own independently. So the CDK work handing that to Jifco, the web hook as well as the actual hydration within which is the part of the hydr basically all the LLaMA work to get us to thrive part of on New Lands. 
And then there are a couple of outstanding conversations that we're having that we're going to have in architecture. One is around the relationship, the order ownership. And then a byproduct of order ownership is going to be how do we want to represent the data for orders within our projections? 
So Antonio has one of those and you all of this has the other one in a different epic that deals with how do we want to deal with our ownership? But these tickets are ready to pick up from a prioritization perspective. Our goal like we need to start working on recurrly backend. 
So definitely looking to kind of close out the smaller items that we have for refactoring. Lens I think let's maybe you and I touch base afterwards. See, what if we can close out those tickets in the next couple of days in favor of getting you start jumping in on the recurrly epic and I'll have a single conversation with JFFCO this afternoon. He's expecting a PR on the one refactor that he has, so that may solve it, but I'll. 
I'll connect with him this afternoon as well.

**jeremy.campeau@llsa.com | 11:23**
Okay, this might be brought up in the Architecture Review, but I know one of the big questions I had this morning was still kind of the concept of when we are submitting the order to C Star as it pertains to kind of hydding the information that we need to thrive. Just the thought being that if we can't really do a whole lot until we submit to CTAR just because we're missing information needed for those event screens like the participant I do, for instance. 
So. And I know the Elvis and I talked about it this morning and it sounds like there are a couple ideas of.

**Wesley Donaldson | 12:10**
Yeah, I think the goal for that is to bring that into architecture. Like I'm representing this.

**jeremy.campeau@llsa.com | 12:14**
Yeah. I think we just need clarity on what their envision like. And we can go from there.

**Wesley Donaldson | 12:18**
Yeah, I'm. So this idea of order ownership has the idea of kind of integrating sooner rather than later into the C star into pushing orders and into C STAR so getting the participant ID information here. 
So this is a part of that idea, like not waiting until after the current implementing the current injection to actually get connection back to C Star like that's for architecture, basically.

**jeremy.campeau@llsa.com | 12:48**
I. 
That's all I had.

**Wesley Donaldson | 13:00**
Thank you, Lance. The big concern I see on the board right now is like we still have a few refactor tasks outstanding and the priority of getting us start working through Rick Curly. 
So that's Lance and you. Elvis is sorry. Lance. Ls. Antonio and Giffco are the. Are the engineers tasked with that first epic? So please, let's just connect and see what is blocking you from being able to jump on that epic. We. We don't want to go past today without having start pulling in into our in progress on the. On the. On the first recurrly epic.

**jeremy.campeau@llsa.com | 13:39**
Okay, yeah, understood, and just to not to beat a dead horse. But I do think it's pretty important that at least out of architecture review today, we do have a clear understanding of how we're submitting these orders because that is I do you think that will affect things downstream?

**Wesley Donaldson | 14:04**
Agreed. Thanks, guys.

**jeremy.campeau@llsa.com | 14:10**
Thanks, guys.

**Wesley Donaldson | 14:10**
I now.

**jeremy.campeau@llsa.com | 14:10**
Had another do on.

