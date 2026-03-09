# Mandalore DSU - Mar, 05

# Transcript
**Wesley Donaldson | 00:44**
Good morning, all. Only four of us so far. Let's give it a couple more minutes for folks to join. We just finished our demo call for those of us who weren't, which basically all of us were on it, so folks may just need a minute.
Interesting.
Okay, let's help me ping Meho, because he's got a few items that we need to touch base on.
Okay, we'll do. Let's do... Who's here with us right now? Then we can jump back to me. How if he joins us? So first, let's acknowledge the great prep work of the team on getting us ready for the product. Getting Greg and team ready to be able to display checkout.
So take a lap. Congratulations. Genuinely, truly mean that. To that end, we have a few things. I think all these can really be moved to done, so let's just talk about what can be officially moved to done here.
Again, playwright is not a blocker for us, so let's maybe start with Jeremy.

**lance.fallon@llsa.com | 03:02**
Yep. So that one is merged. Whatever one's ready for prods. Is that six, six, five? That one's...

**Wesley Donaldson | 03:14**
Okay. So... If that's merged, that's fine. You had all of us do the review for this one, right?

**jeremy.campeau@llsa.com | 03:23**
I forget who reviewed it, but we actually went over it today.
So he was... Craig was typing it in, and then he clicked the button. So, he's seen... So, products have seen the feature and all that. So...

**Wesley Donaldson | 03:37**
Perfect and factors. Sorry not to cut you off, but I wouldn't I'm not worried about these. Let's. I just want to touch on stuff that is impacting for today. JFFCO completed his task, so thank you for doing that before. While he was not feeling the best so his no updates on his status. He's waiting for his next ticket, so nothing there.
I'll move all of the tickets over to... Because all these are actually in main. I checked the PRs on these... Over to you. Again, sorry Lance, just to focus on what we currently have on main or what will go on main. The other stuff that's in progress, like the refactor. Don't worry about it for right now.

**jeremy.campeau@llsa.com | 04:18**
Okay.

**Speaker 4 | 04:18**
Your only two things would be what's in review and ready for PR. The one that's in review went out with what's ready for PR. So... Both days. You can do it...

**Wesley Donaldson | 04:36**
The next note with the step... Are you here? Yes, you are.

**stephan.brauberg@llsa.com | 04:41**
Yep, I'm here. Good morning. So 05:50... Sorry, 05:50... Seven's got the approval, thank you, Lance. It's completed 05:50. It's got the two... Thank you, Lance again, but there are some jobs that are failing. That one is not...
Yeah, I think we still have the problem with the smoke tests and generated test data jobs. So that one's... It's depending on the jobs being passed.

**Wesley Donaldson | 05:15**
No worry, it is ready to complete.

**stephan.brauberg@llsa.com | 05:16**
So but it's ready to go to the complete it section once...

**Wesley Donaldson | 05:23**
Once you go through the jobs, make sure that it's working.

**stephan.brauberg@llsa.com | 05:26**
Yes, exactly.
Then there's... I was looking at the MDL 640.
There are a couple of open questions. Then I can try and see if I can implement the missing steps, if those are valid, because I know Michuls got a lot on his hands. Again, I can try and help.

**Wesley Donaldson | 05:50**
You're so smart. Good sir, that's exactly what I was going to ask. I pinged him earlier in the morning just to... Get a perspective from him of what, if anything, he can hand compare with you to hand off to you just because he... The focus on these.

**stephan.brauberg@llsa.com | 06:01**
Three.

**Wesley Donaldson | 06:03**
So he should have already reached out to you. If he hasn't already... If I could just ask you to ping him to see if you can pull any of the...

**Michal Kawka | 06:08**
I'm there actually.
Hayen, so there's only one playwright ticket open. I already reached out for a review. Let me tell you which number that is. So it's 638. I'm going to actually review that. I'm going to click merge just now so we can move all of them to them.
So playwright tickets are done. I just need an assessment on MDL 640. If it's still relevant because I wasn't in the loop for a while because of all those high priority critical issues. So I'm not sure if those gaps still need to be identified or were they already identified?
I'll double-check on the sandbox environment. If they are already addressed by some other developers, they basically close the ticket.

**Wesley Donaldson | 06:58**
Yeah, I know this has been addressed. They could not be required. This has been addressed, not pre-filling from screen search data. Not sure about that, but we just had a review of products of this. I suspect all of these are good. Complete purchase button ignored from form development.
Yeah, all these are good. So I'm just going to complete this guy.

**Michal Kawka | 07:18**
Okay, cool.

**Wesley Donaldson | 07:20**
Honestly, any objection to that?

**Michal Kawka | 07:28**
And I'll start on my side.

**stephan.brauberg@llsa.com | 07:31**
Just a quick question. So is there a way that I can go and double-check that everything, all of those gaps are implemented? Are these changes in main and if...

**Wesley Donaldson | 07:40**
So you should be able to just use the live site or the not live site, but the temp. This is not the right one. Take a look at this science Stepan. It should give you what you need.

**stephan.brauberg@llsa.com | 07:52**
Seven.

**Wesley Donaldson | 07:55**
It's in the chat.

**stephan.brauberg@llsa.com | 07:57**
Appreciate it, thank you.

**Wesley Donaldson | 07:59**
So sorry, my apologies. So let's not do that, let's leave it back in review and Stepan, I'll hand it to you.

**stephan.brauberg@llsa.com | 08:07**
Yeah, that works.

**Wesley Donaldson | 08:11**
Alright, cool. "Hi, do you want to just talk us through the problems?"

**Michal Kawka | 08:17**
Sure. So I didn't really have time to address them because we were fighting another critical issue yesterday.
Still very late night on my end. So the problem was that we discovered that connectors were actually never deployed to blue, so we were deploying to green all the time. There was just a minor issue that took us forever to find. Basically, if we deploy connectors, we are using the `n` variable from GitHub, which says either production or development. This second variable is then mapped using a mapper to either prod or dev
but that wasn't the case for the GitHub action because it was using a plain variable, so there was always a mismatch. The action couldn't find a status that existed in prod and in dev as well because it worked neither in dev nor on prod and it couldn't find the status, so it always defaulted to blue. The default scenario was basically for the first provision, right?
So we always have that first-time problem. So we had to default to one of the legs, and in the end we're always defaulting to one leg and we never updated the other leg. So we're actually always deploying the same leg since January 9th, I believe. Or January 7th, I believe. You must prepare a post-mortem for that. There should be already tickets to prepare the alerts for that.
If the versions diverge too much, we should basically trigger an alert and be notified that there's something wrong going on but I need to replay the events. It's 679, and I need to implement alerts for the parked event.
So it's 685, I'll be working on that.

**Wesley Donaldson | 10:15**
Okay. Help me with the priority of your priorities. The resolution is a known issue. So this is a lower priority than anything that's actively breaking in production.
So is park events? The underlying... The underlying problem for parked events was related to just the type safety within the connectors. Is this an active issue now, or are we just really doing resolution to act to issues, or is there a fix that is... Which one of these is actively something you need to fix now versus you're reacting to and resolving?

**Michal Kawka | 10:54**
Nothing, so all issues were already addressed. So new events are being processed as expected, we just need to replay the old events, which is the ticket six, seven, and nine. All the events, almost all of them. I posted the analysis yesterday.
So all almost all the events were parked in a stream because of the type safety.

**Wesley Donaldson | 11:11**
People much more much.

**Michal Kawka | 11:15**
So the six that Antonio merged about the partial making our schema, basically more relaxed, it fixed all those issues.
So if we replay those events, it's going to be fine. There's basically no customer-facing impact because those events don't send any emails yet. When it comes to the parked events alerting, that's of course ongoing. We don't need to fix anything in here.
The connectors are not deployed to blue resolution. It was fixed yesterday. So Dane opened the PR. We merged that. We tested that, and it was a result yesterday. So, yeah, it's done.

**Wesley Donaldson | 11:57**
Can you just... Where is the write-up for that? If you can just attach that triage investigation just so we have it from a traceability standpoint?

**Antônio Falcão Jr | 12:04**
Two two.

**Wesley Donaldson | 12:05**
Part of the resolution is we need to do a post-mortem on this one. So I would say let's not... So it's two things. It's like the post-mortem effort as well as the actual data resolution. So let's not close this one. I'm not going to close this one out yet until we've documented the post-mortem.
Okay? Cool. All right, I think that's everyone. Anyone who has not gone... You all, we are all who didn't give you a chance to speak, anything that you were working on, or anything that you're concerned about?

**Antônio Falcão Jr | 12:41**
I'll make just a quick heads-up so I have my work done, and I just need to get a Sam's revealed as a stakeholder of this implementation, and just after having you as well, Wesley. So I will submit to the team to be with you.

**Wesley Donaldson | 13:04**
Sounds good. Next steps on this, obviously. Sam's review. But is the expectation...? Do we want to use the architecture meeting next week to talk about your thinking around the pattern and how the team could use...?

**Antônio Falcão Jr | 13:16**
Absolutely.

**Wesley Donaldson | 13:16**
Or do you want...? Is it premature to do that as part of the demo tomorrow?

**Antônio Falcão Jr | 13:17**
Yeah.
It is only because I would like to get from Sam a definition for a specific part on the query side. But let me try to make it as fast as possible.
I don't know. Maybe we can do that for tomorrow and just get these points done.

**Wesley Donaldson | 13:44**
Sounds good.

**Antônio Falcão Jr | 13:46**
Yeah.

**Wesley Donaldson | 13:47**
All right, okay, guys, you all... We are all... I don't think you're wrong actually, hold on, and I miss you. You're not okay. No worries. All right, guys, thank you so much. Really appreciate the hard work of the past couple of weeks. Three weeks to get us to the state of commerce, and we have a valid demo product. It is happy, so please take a lap. Take a smile. For tomorrow's demo.
I think it would be interesting to talk a little bit about how to focus a little bit on recurring specifically. I think that is still not clear to everyone, and obviously, not everyone had a chance to touch that.
So I'd like us to host a demo, but I'd like us to go a little deeper on things that are not necessarily transparent to everyone else. So Jeremy is an example. Validation integration with the UI lands. Integration with the recurring order like anything else that other folks just do not have any transparency.
I'd love to just so if you want to share with me just a one-liner of what you think you can share. I mean, demo... Appreciate that. Cool. All right, guys, thank you so much.

**Antônio Falcão Jr | 14:56**
Guys, have a good one. Thank you.

**jeremy.campeau@llsa.com | 14:58**
Thanks. Have a good one.

