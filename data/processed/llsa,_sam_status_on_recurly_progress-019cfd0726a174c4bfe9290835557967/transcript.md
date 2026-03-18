# LLSA, Sam Status on Recurly Progress - Mar, 17

# Transcript
**Wesley Donaldson | 00:01**
Afternoon. A lot of background noise.
That's better. When I hear the background noise, it's worlds better, right? So I think this is a call-to-action moment. So where are we? Context, completion of the recurrently direct recurrently commerce.
Stacey's direction generally is we have to deliver this brand. I think that's clear soft direction. He had from last week was this idea of... I'd love to get something in recurring by Wednesday to start getting a few for orders coming in.
So that's a soft... He'd love to start seeing us get orders into CSTAR around mid-week. It's called Thursday-Wednesday, in conversations with the team, and just pushing them.
I have a scoped effort against two epics that get us there, but those scope efforts have us basically getting the order ingestion portion completed this week, and then the CSTAR injection portion targeting the 27th next week.

**Speaker 2 | 01:15**
[Laughter].

**Wesley Donaldson | 01:26**
The obvious thing there is if that holds one, it's tight.
But more importantly, that would leave us with a very limited amount of time the following week, the week of the 29th, I think something like that. To actually get this in doing refinements, cleanups, and testing before April first, I had a couple of side conversations with different team members pushing them a little bit like, "Hey, what are our blockers? What are our challenges? What do we feel is the critical path to get us to the completion by the end of the month?"
The answer is they understand the systems. It's just the perception that we can get it done so much faster. Even with the help of AI, the team does not feel we can get both epics completed this week and could not meet Stacey's soft deliverable of, "Hey, can we get started seeing something inside CSTAR on Wednesday?"
So couldn't they just...? Couldn't they make that? I had a couple of sit-downs with Antonio, Lance, and Jeremy, and I specifically challenged them, "I need you to tell me what is the current... What is your major blocker to... Are your concerns about the timeline? Are you clear on the implementation plan? Are you pushing back on the idea of how much time it takes? Your priority..."
A long story will be shorter. They're not worried about their ability to deliver. I think the concern that I see is I'm worried about our ability to deliver in the timeline that space has mandated.
Then your question is like, "Is there a surface area thing here? The right people are on the right work like Jeremy and Lance Antonio. They're all tucked in. Jiffco is helping out and pulling tickets. Miha is freeing them up because he's taking all of the production challenges as well as some of the smaller features that Beth has."
So generally the team is tucked in. The concern that I see is I feel the need to acknowledge to Stas that we are in danger from the time and not because we cannot remember the work, but because it's just the amount of runway the team has and then leaving ourselves enough time to truly run and test and verify and build up that trust in the system.

**Speaker 2 | 03:38**
I mean, you got to just say it as it is. He actually just asked me just now. I circle was on one just before we joined the call. It certainly will come back after this call to give them a timeline. We where we expect to...
So I think that's... I think all you got to do is just put a little GAAP shot to them using Excel sheets or whatever. I just highlight the purpose of what they're working on. The desire is what they're working on, but an assistance is what I've got from the team. Things we like this is the natural truth. Yeah, just the natural of the truth. You know this is even with AI with everything else.
But nobody thinks that this is them thinking. Their estimate is... Just want to be one?

**Wesley Donaldson | 04:27**
Yeah, I think I'm I'm pushing maybe I'm pushing it too hard. I'm challing the team on the idea of like why AI isn't making this a little faster. Just as an example, it took me an hour and a half to do, I think, a pretty comprehensive analysis of how do we create that mapping between the two systems.
And when I challenge him, like, well, show me what you created. Like, here's where I'm at in my simple investigation. Do you have something similar? Like, the conversation doesn't go the way I would anticipate it is.
So I'm. I'm kind of at the point now where I'm like, no, I want to sit down and do it with you. I'm gonna walk through what I did and show me what you're doing and help me see how your what your process looks like to get to this.

**Speaker 2 | 05:10**
How would you do that? It.

**Wesley Donaldson | 05:12**
I just do a screen share. I wouldn't really just repeat the steps that I did, which are just super basic prompting. As far as I'm concerned, it's really just about exactly...

**Speaker 2 | 05:19**
What is it for value for details?

**Wesley Donaldson | 05:23**
That's the part I'm struggling with. I feel like I'm just going to be like, "Well, Daddy's coming over and here's how you should be doing it." That's the war, and trying not to build that culture.

**Speaker 2 | 05:32**
Yeah, well, not just that, but show me if it's actually useful because what have you done? Show...

**Wesley Donaldson | 05:37**
I'm sure happy to show you.

**Speaker 2 | 05:37**
If you've got it in...

**Wesley Donaldson | 05:38**
Hold on a second, just...
Okay, so it's all inside of... Jeremy and I are collaborating on this document here. Which one is it? This guy? So this is just an amalgam. I pulled together all the different sources of information. What? The button that I just pressed. Go back. Let's pull together all these different sources of dimension information. The idea here I just started with the webhook. I took the Recurly documentation, took the detail that we have, took the samples that we have in our code base, and just said, "Okay, great, what am I getting?"
Then how do I get to the hydration level? I need to actually propagate a shop ID to... So I built out the plan based on the individual line item levels that are inside the Shopify detail. Then where should you get that from based on the hook coming in from a curly?
So I just built out all those mappings and what you should do to generate it. Then be a little bit like, "Here's the plan of how you should be doing it." After that, the next step is great.
I understand the webhook, the API endpoints, and what's hydrating from each one of those. What is the actual thing that exists inside of Shopify's detail or what Shopify expects as far as the scheme is concerned?
Then how the hell do I hydrate that? So I took that... That's basically what that guy is, and then started going, field by field, and coming up with, "What is it? Is it a number? Is it a string?"
Then trying to figure out what my hydration plan would be to populate it. As an example, the browser IP is not really used anywhere like that. At least Claude and I could find, so I was like, "Whatever, just throw some garbage in it."
So I did that for all the core customer, participant order item product information, all the things I had basically the activity right there and figuring out what... Okay, great. Now that we have that, the next step should just be interrogating each one of these and solving the questions that aren't... For example, I don't know if any of this met information is truly needed or not.
It's very Shopify specific, but in my mind, this gets us to what is needed and then how to source it. There are obviously gaps. I'm not pretending that this is a comprehensive document, but it gives us a good map of things that we need to chase.
My direction to the team was, "Hey, just spend some Claude session and look for... Here's what you have, here's what you need, and generate some kind of... That we can work from."

**Speaker 2 | 08:31**
Who is working in this particular? Can't.

**Wesley Donaldson | 08:33**
So this is Jeremy right now.

**Speaker 2 | 08:34**
Any particular...? How do you think he's backing up?

**Wesley Donaldson | 08:42**
So my one-on-one with him this morning. I asked him, "How do you...? What's your confidence level?"
He felt like, "Hey, I understand what needs to be done." He doesn't... His pushback is the expectation that it can be done this week, but he's fully aligned that, "Hey, I think we can get this working." He understands the static map that needs to be generated. He understands the items and how they get into CSTAR, so he's the right person in the sense that he understands all the systems, and he feels confident he can deliver it in the my originally projected timeline of the end of next week.

**Speaker 2 | 09:18**
The station is looking for a signal. Whose was not a complete...?

**Wesley Donaldson | 09:22**
Agreed. My proposal to them along that literally taking what Stacy and Jennifer provided was, "Hey, let's just get the major buckets, the connections working. Don't worry about what's inside of them.
Create a static file, create the LLaMA sure that it's working, and then we can start adding value to it so they have that direction. I haven't told them... No, absolutely create that first. I think that's a level of detail you've encouraged me not to do with the team.
So, they have that clarity to know that, "Hey, just give us something and then we can build on it." That signal...

**Speaker 2 | 10:01**
He said he just got a portfolio included. Great way. But do you have a session still this afternoon or...?

**Wesley Donaldson | 10:04**
No, that was this morning. I had a session with them this afternoon and we had a mini chat mostly over teams this morning as well. No, session was yesterday afternoon. Then just mostly chatting today.

**Speaker 2 | 10:16**
Yesterday, I... Now I'm looking at this in front of me here, and I'm like, "Okay, I see some LLM chat open the outwork."
So it's... I think about what Jeremy might be doing, but it could be anywhere from... Yeah, this looks useful, but it's not related to... I didn't even think you said yes, this would be... I should probably do something like this, but I think that's where... Somewhere anywhere in there and those two extremes.

**Wesley Donaldson | 10:39**
I pra.

**Speaker 2 | 10:52**
Sorry, I'll get closer to the... A lot of noise in the cancellation scheme.

**Wesley Donaldson | 10:58**
Of course. Okay.

**Speaker 2 | 11:01**
So, sure, if what you're hoping to achieve here with this is some level of getting enough to accelerate by reasonableness...
I'm thinking about how I would implement this if I were to go about it, and I want to do it in quick time. They've got to build that infrastructure as well as the translation layer. So what you've got is the translation layer, it's necessarily infrastructure that gets deployed to... It's a bunch of lands and connections and connectivity integrations. Do we know any update on that? For far?
That is. Is that? Is that. Jeremy. Only mod that.

**Wesley Donaldson | 11:46**
No, so it's broken out. So it's Jeremy only owns the Lambda that's reading from the SQS to actually... So Jerry owns the Lambda that is...

**Speaker 2 | 11:59**
I'm going to FL to.

**Wesley Donaldson | 12:00**
Sorry, I'm confusing Lambdas and Jeremy there. Jeremy owns the part that takes in, and Antony hasn't given him clarity on exactly when it's triggered, but he's writing a Lambda whose job is effectively to get the information out of current and then generate this mapping and push that into an event store on basically push that into the existing C star flow. Do I know if he's built a Lambda already explicitly? No, I have not asked him.
Have you already created a Lambda?

**Speaker 2 | 12:31**
What's the state of integration time? Impaty?

**Wesley Donaldson | 12:34**
Yeah. Which I pull up every morning with those folks, those good folks.

**Speaker 2 | 12:50**
Okay. So what? Just orientally, we do one.

**Wesley Donaldson | 12:55**
Web hook is Lambda, this is getting the information in, pushing on SQS, Antony is hydration. Once Antony gets all the events in and he's already been communicating well with Jeremy on that next down next step up is the Lambda to actually take information out of current and push it into CTAR.
So somewhere here there's some connection and then goes that goes into CTAR of what we are...

**Speaker 2 | 13:21**
So on this, let's put labels like... Let's create little circles. We're given different names, maybe even have as if you want and grab their faces, right? And then everything that's in progress could be...
Then let's talk about the lines and the... This is really all we've got to show... This should have to show you. So if you just make these lines glue showing what they're working for and they...

**Wesley Donaldson | 13:43**
If you have...
I asked them to do that as part of their end of day. But I can. I could take a big deal.

**Speaker 2 | 13:55**
Just to do it... Through... Nobody... That's the other thing you need to facilitate a message, right?
Then, in terms of the blue lines, sorry, the lines between lines, those are the most important places... The lines in the middle are like, "Who's working on that line?" It's a separate question, "Who's working on the box?"
The event that can't be the weather coming in from recurring and hitting a LLM, that's a test and a push and a goal to trigger it and then making sure the math receives it. That is the most important part in the machine work because the boxes are very easy to fill in.
Think about it like you're covering the lines. Yeah, that's the easiest thing to do.

**Wesley Donaldson | 14:52**
He.

**Speaker 2 | 14:53**
The harder one is actually to be picked from a LLM but is it actually pushing to execute us? So these are the questions we want to ask one of the days.
But do you have the WebM try?

**Wesley Donaldson | 15:07**
I'm sorry I'm losing you badly there. This is what you want to ask on the stand-up? Is the last part I heard.
One more time.

**Speaker 2 | 15:31**
That wasn't any better or no.

**Wesley Donaldson | 15:33**
That's better. It's louder.

**Speaker 2 | 15:37**
All right, I'll try that. So what I'm saying is the question you want to ask every day is, "Can I make this blind blue?" Have you seen an event come from recurring into the weather?
If not, please focus on that. This is the most important part of the equation. What's blocking them from doing that? Well, I've got to have a land that... Okay. Cool. Tomorrow? Or later on, will you be able to show me this blind blue?
So long as the line is red, it means even as a developer, they have not seen the event come through. If the line is blue, that means in some dev environment they've seen it come through. That's a big win. This is what delivers projects and what fails projects is those bad red lines. Are the red lines green lines, not green boxes? Obviously you need the green boxes, but it's the green lines that are giving 70-30% importance, even though all the work seems like it's inside the...

**Wesley Donaldson | 16:30**
It's not actually integrated.

**Speaker 2 | 16:32**
Exactly, it's pointless if it's not integrated.
It's a tree that fell in the forest and no one heard it.

**Wesley Donaldson | 16:38**
Agree to...

**Speaker 2 | 16:39**
So that's what I'm trying to push for. And I think if you communicate that back to Stas now, say, look, everyone's working on getting the boxes blue before we get the Lions blue, right?
Like that's the conversation to have with this. So Jerem is building the initial infrastructure and so on to do this. I don't think he, you know, the work is not something AI can do here. He's just, you know, wrangling this stuff to get it.
That's. That's the conversation. I left for the states.

**Wesley Donaldson | 17:07**
Yeah. God, I'm happy to have that conversation with them. I want to make sure that one. You're aware of this.
But to like, you know that.

**Speaker 2 | 17:14**
Yes.

**Wesley Donaldson | 17:15**
I didn't need to have that conversation. I was planning on having that ideally today, but maybe worst case tomorrow, just to give a status on where things are and how we're projecting towards his timeline.

**Speaker 2 | 17:27**
Yeah, sure. Even outside there, do you see this stuff going into the curly just like ask Jennifer and states have business users already started putting things into a recurring if so that's that line makes it go blue.

**Wesley Donaldson | 17:40**
Which they have this guy here. This is absolutely blue. We're pretty mostly set up there, actually.

**Speaker 2 | 17:46**
Okay, great. So that's if they're set up and that's blue.

**Wesley Donaldson | 17:52**
United.

**Speaker 2 | 17:52**
It will go green once we see that it's working. Similar with customers, yeah, you go... Okay, so this is the game. Just really push the team to get you green lines and the rest will look after itself. You haven't... You have that saying. You look after the pennies and the pounds look after themselves.
It's the same here. You look after the lines and the boxes look after themselves.

**Wesley Donaldson | 18:21**
Okay, I like that. Other than communicating, like, importance and just like, I'm trying to find the right balance of we're, like, leaning and stuff like that, and I don't want to be overbearing.
So any thoughts that you have around like is it. And I've asked the team like, hey, what makes it most effective for us in a working session where it's just, you know, three people and we talk through it? Are you struggling for like ideas and next steps and it's not the ideas and next steps.
So I'm I think it at this point, I my feeling is it is what it is the problem. And it's more about managing expectations for outside of the team than it is about pushing them to go harder.

**Speaker 2 | 19:04**
Let's do something else later. I got maybe... So, let's do instead of doing Friday in addition to our Friday AI sessions, which I'm not available at, and these will be especially now like what people are doing... Let's have an AI acceleration session, an acceleration Tuesday session this week. Maybe we can do it tomorrow, but see tomorrow one PM might...
Okay, let's do an AI acceleration consultation, right? So just... Yeah, let's call it the Claude Doctor sessions. The Claude Doctor, what should we call it? The Claude Coach, Claude coaching. I'm just going to lead that. I'm going to bring somebody who has something they're working on.
I'm going to ask someone who's brave enough to bring something they're working on, and I'm going to work with them on it for an hour until the teams are okay with that at the very least, we'll just start to provide what you're trying to do with your document.
More like, I want to bring it to their workflow, I want to bring it to their problem. I want to bring it to what they're currently struggling with so that I meet them where they are. Right? That's my worry about the doc you've got.

**Wesley Donaldson | 20:20**
For I.

**Speaker 2 | 20:21**
I think the best intentions are there, but it moves them from where they are to where we are. Now there's an impedance mismatch between frames, right? So what I'm trying to do here is solve that with you.
But make it so that it's like, "Hey, look, what are you guys struggling with? What are you actually working on now?" That's how I would do that with AI, and I think that will be better for that person and a one-off working.
If we do that on a weekly basis, hopefully, we can get everybody accelerating just a little bit as they go because frankly, you need to be a really seasoned architect to get the maximum value out of AI, and not everybody is right.
If you're not, it's scary.

**Wesley Donaldson | 21:00**
Yeah, my... That was kind of my goal for the AI working session.

**Speaker 2 | 21:04**
No.

**Wesley Donaldson | 21:04**
I always feel better canceling that and just saying, hey, Sam is going to lead a couple of these while we are pushing through recuurly.
And I'll so let me restructure repro, I'll move the time.

**Speaker 2 | 21:11**
Yes.

**Wesley Donaldson | 21:15**
I'll just reframe it. But that's that really was the point of that session.

**Speaker 2 | 21:19**
Yeah, totally. And that's let me help them. Because I feel like, you know, with me, they feel like I'm meeting them where they are. You know, there's more familiarity with them, like a this is a fellow coder rather than like this is a manager.

**Wesley Donaldson | 21:33**
Yes, I hear you. All right, so I'll aim for tomorrow at 01:00 pm. You said we're going to reschedule the architecture meeting, so I think it might conflict with us.

**Speaker 2 | 21:40**
Yeah, let me...

**Wesley Donaldson | 21:44**
Let me... I'll figure that out.

**Speaker 2 | 21:47**
If my calendar is open and I mean an X team review pretty much until the end of the day, I can move anything around.

**Wesley Donaldson | 21:54**
Okay. So, end of day after X.

**Speaker 2 | 22:02**
Meet somebody later today. So I'm going to go. Is there anything else on your topic?

**Wesley Donaldson | 22:07**
No, their quantum is looking really good. Nico, bless his heart, he gets easily distracted, but I think he's targeted, so he's got a couple of clear deliverables for that. Down his button is good. We're... I haven't gotten anything back from Jeffer Pingham on just how we want to coordinate getting the onboarding for Sasha and Slava, but that's not a big urgency either. We have a meeting this afternoon at 06:00 pm Eastern Time to connect with Ruben. Don could make it, for obvious reasons.
So I was planning on joining that session just to have someone other than Nicholas in there with Ruben.

**Speaker 2 | 22:48**
So maybe they're here actually today because this is where they work out as well because the co-working space on that day here.

**Wesley Donaldson | 22:53**
Yeah, I don't think you need to be on that. It's your call, obviously, but the expectation there is... I've asked Nicholas just to focus on what the discussion topics were and kind of showing how we brought those to fruition and closing on any of the loops that he raised with... With Ruben.

**Speaker 2 | 23:12**
All right, that sounds good. Thanks, Wes, I appreciate it. I have some head down time.

**Wesley Donaldson | 23:18**
Good luck. How? I sent you one small bug like, but see if that that's something.

**Speaker 2 | 23:22**
I'll get to it. We're just trying to get a we're hitting snag after snag, and I'm trying to just get through them all, but yeah, I'll get back to Claude. It is. It is a priority after this priority.

**Wesley Donaldson | 23:35**
Totally understand. All right, sir, thank you so much for your time.

