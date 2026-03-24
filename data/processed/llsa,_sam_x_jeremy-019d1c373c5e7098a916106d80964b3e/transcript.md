# LLSA, Sam x Jeremy - Mar, 23

# Transcript
**jeremy.campeau@llsa.com | 00:03**
Hey, Wesley.

**Wesley Donaldson | 00:04**
Hello?

**jeremy.campeau@llsa.com | 00:07**
Sam will be back in a minute. But he's. He's on the meeting, as you can see. Just not at his computer. So.

**Wesley Donaldson | 00:13**
Yes, Sam does a really good job of being mobile while being super productive all at once, and I and his background is meaningfully better than mine own.

**jeremy.campeau@llsa.com | 00:24**
Yeah.

**Wesley Donaldson | 00:33**
Okay. I do think I want to connect with Lansom just to make sure I get him the tickets and stuff that he needs here because... I'm not sure if he's... Have you worked on MMA before, or do you know if he has?

**jeremy.campeau@llsa.com | 00:47**
I've worked with it. I'm sure he has. Yeah, he's... I think he's been here for three or four years. So he's... I always ask him questions when it comes to things like obviously the legacy stuff because he worked on it, but all the other stuff we have in legacy, I'm always pinging him.
So he's very knowledgeable.

**Wesley Donaldson | 01:09**
Okay, perfect, right? Yeah. That actually works out really nicely to have. That got hurt.

**Sam Hatoum | 01:15**
Kids just got home. Up. So... I'm escaping... All right, Jeremy, can you hear me?

**jeremy.campeau@llsa.com | 01:26**
Was that...? Sorry, I think I just must have gotten cut off. I didn't hear what you asked.

**Sam Hatoum | 01:29**
That's so good, I was just saying how's it going?

**jeremy.campeau@llsa.com | 01:32**
I'm doing good. How are you?

**Sam Hatoum | 01:34**
Good. This is your time more than it is anything else. I just wanted to offer up any help around what you're working on, any tools you do, any acceleration you want, any AI tools help you want, any event sourcing help you want. You let me know. Time is yours.

**jeremy.campeau@llsa.com | 01:49**
Yeah. So I'm working on the integration into Cstar from THR. So there are a few different constraints, but I'll just explain what Shopify is because that's how I best know how to describe it.
But what we did was we took our e-comm API, which is for our e-commerce website, and then we just threw in this function that would take in the Shopify info and then shove it into the e-comm shapes. That way, the orders can work. I don't know how much I talk about legacy, but there's a ton of store procedures that randomly run. There's something called a tickle where if you go to a web page a certain way and see the star, it'll change some of the data.
So it's messy to work with. With the recurring stuff, there are a lot of test cases, and I'm trying to fit it into the e-comm shape hole and work it all together. I have 1616 test cases that I've been working through, and I have it finally working correctly.
But the reason why this is needed and why it's annoying is there's a thing called FSA, and if you look on Cstar, which I can share. So the way the orders get into Cstar, I can do that.
That's not really a problem, but the balance needs to be zero. If it's not zero, then it breaks FSA, and then FSA if that breaks, then they're not able to do the screenings because for some reason, something happens where the balance isn't zero, that it breaks the system so they can't get the screenings that are supposed to be done, and then people can't get screened or something.
That's my understanding of it. So that's what I'm working on. But as you can see, I just got it working for one of the example doors.

**Wesley Donaldson | 03:38**
[Laughter].

**jeremy.campeau@llsa.com | 03:44**
Okay, so I have it working. But one of the things I just thought of, as you were saying that we started writing this one, it's really old repo.
So it's on an old version of C Sharp, which I think might not... Or may not be an issue, but we probably need to just add a Claude MD file and some other things that would make it so that way it's more usable with AI like the constraints as far as... "Hey, we only want to focus on using this function because that was one of the requirements as part of the project was like we did with shopifying." It was, "Hey, don't touch any of that stuff.
That's the old e-comm." Just make a function that shoves it into the e-comm data type, basically. So if you have any suggestions for what would be... I don't know. I know there's Claude MD, I know there are agents. MD files and that like skills and it seems like it keeps changing too.
So maybe that would probably be a good first step because it seems like now we're adding more to this EC API. So if there are a few low-hanging fruits as far as how we make this more AI-friendly, I think that would be helpful overall.

**Sam Hatoum | 05:00**
Cool, yeah, I can definitely help on that. So one thing I've been using is some technique called Scatterger. Which is like when I go into any new codebase and I want the AI and me to understand what the heck's going on. Basically send off with Claude. You can say to it, "Send off a bunch of Claude agents to go across every single directory."
Anytime there's a directory, it looks at every single file that's in that directory, and it creates a reading in that directory describing all the files in terms of their inputs and their outputs and what they do and all of that stuff, right?
Now where you have an index, like basically what's a file? It's all IO at the end of the day, everything's a module. When you really think about it, everything's a process with an input and an output, and every process that has an input is basically like a function. It doesn't matter what language it is, whether it's a sales procedure, whether it's code Java attached, it doesn't matter, right?
It's all just a process, and it has inputs and outputs. So the first thing is to go over every single directory and make an index of all the input-output modules that exist within that directory. And then...
So it does that and has to scatter, and then after that it starts to gather. It starts to go up a level and say, "Okay, start to make relationships between all the different modules and what the interaction between the modules does."
Then it puts a gather.md. So scattered.md is for all the files. Then gather.md is bringing up all the individual knowledge together. Then it goes up a directory upper directory every time, and it keeps combining all that knowledge every time.
So in doing so, what you've done is effectively pseudo-indexed the system in an input-output modularized way. So now that you can leave these files in there with scattered together and when you're talking to Claude, you can say, "Look, I've already done a scattered together in my knowledge approach. I'm trying to do this function, have a look at the top levels, gather..." Then it starts to find its way.
That's a really good way to hide the context of Claude without having read it without having it read all the code. Now you're on Claude Max.

**jeremy.campeau@llsa.com | 07:00**
Yeah, whatever we got. I'm assuming it's Claude Max. I haven't run out of tokens or anything to sell.

**Sam Hatoum | 07:05**
Okay, well, the reason I say that is because Opus on Claude Max actually has a one-million-context window, which means it would fit all of these and then some more. Okay. So you can use that.
I mean, just go open up your Claude instance now. Let me see if you do in the console. I see in two seconds.
I'll fire up a new one... Come on...
Scroll up a little bit, please. Nope, it's using Sonnet 4.5 on the right. Do slash model. Yep, set the model and then say the one at the top. Yeah, default recommended, so use the one at the top.
Okay, and it says "Done." Can you exit one more time and do it again now? Yeah.
So it's using Opus 4.6, but I don't see it with the medium window, do you? Update... I don't know how far behind you, but definitely run the window upgrade. Claude right there... That commander got that.
You've already used your limit. Okay, so you haven't got the max, by the looks of it.

**jeremy.campeau@llsa.com | 08:34**
How did you see my...? I used my little bit. Did it just pop up, and I missed it?

**Sam Hatoum | 08:39**
It popped up? Yeah, it just actually said just a second ago. I said, you've already reached and then you can ask for more, so you're already at Max. I thought we I thought everybody got Max, but anyway, so what I said stands.

**jeremy.campeau@llsa.com | 08:52**
Yeah, scatter gather.

**Sam Hatoum | 08:54**
Yeah, let me send the prompts I created for the skill for it, let me send it over to you.

**jeremy.campeau@llsa.com | 08:59**
Okay, yeah, because, you know, I try to read up on stuff, but it seems like it goes quick. And then too, working in this type of project, like a lot of these, you know, I'm not super knowledgeable on the Legacy system. I worked on the Shop five thing, but my understanding is like there's just like random stored procedures that change stuff.
So based on the gist I get of how this is how the Legacy system is set up, it's like very database heavy in the sense that like there's like logic in different sort of procedures. So I'd imagine that'd make it harder to have Claude work, but I don't know if that's just me underestimating its ability to understand things.
It just seems like based on how I've worked with Legacy and setting up the Shopify stuff, that there's just... I would think that the way that Claude would get contact would just read the repo.
But not all that context is going to be in the repo in this scenario because of all these random constraints in the database, there are random search procedures.

**Sam Hatoum | 10:09**
So I think...

**jeremy.campeau@llsa.com | 10:10**
I'm just looking at...

**Sam Hatoum | 10:12**
You can do what I said there, which will basically just help in terms of already indexing. Like Wes was just saying that when you scatter together, it has fewer places it has to look because it's already indexed there.
You're creating actively. That's by doing as... So the second thing I would recommend you do is open up a Super Whisper, which is basically like a chat, right? So if I just show you on my screen real quick, if I share my screen here and at the top there, I use this thing called Super Whisper. Now I go into Settings and under Configuration. I'm sorry, what is it? Models library. You can use the parakeet.
So if I just use this mode here, I'll show you what I mean. I just use voice to text. Don't do super because then it requires a GPT-5, but you can just do simple voice to text and use Parkey. What this does, it actually runs locally, so then I can do things like this. I can say, "I'm going to show you, Claude, next, if I open up my Claude over here and say, "Hey, Claude, I want you to go and look at this area of the system where I'm a little bit worried about the store procedures that happen."
So be sure to take care of those. It's not as simple as it looks. Things are hidden away and blah. But I just basically say a ton of what's on my mind, right? You see some of the prompts that I give to Claude, it is literally this big.
Just have an exact conversation with it like you're having with me right now. Talk to it. First of all, give it a scatter gather. Say, "I've already done a scatter gather. You can find all these files here." That's what I'm thinking, and I'm a little bit worried.
Don't just look at the code, look at the stored procedures. There's been a lot of funky stuff. For example, there's a tickler, and there's a... Just give it all this stuff again, right? All over again.
Once you've... But when you finish, say, "Interview me." Until everything I said is crystal clear, okay? Then it will keep asking you questions, right? You'll have all the answers at the end of this session.
Say, "Listen, we've had a lot of good context here. Store all of this in your memory." It's got a new memory system now, and we'll actually store it in that project under the hood in a memory folder as well.
Okay, so the combination of what I just said means that every time you come back up with Claude, it should have a lot of this stuff prehydrated for you so you don't have to repeat yourself all the time.

**jeremy.campeau@llsa.com | 12:28**
Okay. Got it, that's good to know. So this memory is like a new thing, is it just like a Markdown file? Fancy Markdown file, that it? Yeah, exactly.

**Sam Hatoum | 12:36**
I'll share where it goes. You actually have control over it. So if I just go over to my CD, a lot of people don't do this. But go into your home Claude directory, and you'll find a bunch of stuff. CD projects in here.
I believe if you look at these, these are all my different projects. So if I just go to my most recent one here that I've been using... Alright. At the top here you'll find... Just do that one more time.
Sorry, just look up. Our most recent one was on January 11th. At the top, there's the top one. So this is fairly large 7.2 MB. That'll do. That'll be a good one. So see this? This is my chat transcript, right?
Like if I show you what this looks like at this and pump it into Jira like, this is actually my chat transcript that I had with it right from the beginning for a given session. So this is already useful information if you ever want to find stuff like that, like you had a chat with it.
But if I go and say instead here... Right. Okay, so this is just got full results, but somewhere in here's memory, I can't know where it is. Just go look at something.
So I said over here, like, "Hey, look, save this into your memory." And you can see this says "Write that into memory." So this is... Let me grab that URL real quick so I can go look at it.
Okay, so this is... Here you can see this is memory of things that I've asked it to store in memory, right? It's got all this feedback in.
If I just do "cat memory" like it's now got a reference. It's got a little index of its own, kind of like a scat together of its own. Then over here, if I say "This now this is something that has had so..." You can build your own memory for your project, right? Which effectively is now you're controlling more of the context as Claude is building it.
So when you say "store to your memory," it's just going to basically write a Markdown file there for you.

**jeremy.campeau@llsa.com | 14:52**
Is that scoped to your personal machine or is that for the project?

**Sam Hatoum | 14:57**
It's actually for the project that you're in, yes. So that's an interesting point because what I'm about to do, actually, is create a cause. I have a lot of monorepos that are checked out with different work trees, and it's the same one over and over.
So what I'm going to do is actually make a sim link like something like that, or have something that manages the memory. I'm going to take over and then manage it. But that's the kind of stuff you... Really helps you
keep it all in context.

**jeremy.campeau@llsa.com | 15:20**
And then for the Claude and D like, would it be sufficient enough to just copy and paste one for the mono repo?

**Wesley Donaldson | 15:26**
Much as copy and paste the windy. But really work.

**jeremy.campeau@llsa.com | 15:28**
Or does using internet really work? Well, because I try to keep up on it, and I've seen things about how you've got to manage context better, which means you've got to make sure you're when you make these files, like Claude files, agent files, whatever, you've got to make sure they're more condensed or whatever and stuff like that, or sometimes...
It doesn't work great because I probably should just make one for this, but I just wouldn't really know where to start.

**Wesley Donaldson | 15:52**
Start.

**jeremy.campeau@llsa.com | 15:52**
I don't want to hinder it from thinking or something.

**Sam Hatoum | 15:57**
So here's what I would do. On your memory thing that I just said, the read me generator, right? Go to do this scatter together read mes and your Claude MD just say to it.

**Wesley Donaldson | 16:07**
I think this is a project.

**Sam Hatoum | 16:08**
You know, this is a an old school project that it has like, you know, store procedures and so on.
Like some of the stuff that we just mentioned, just brief. Be sure to look at all these pre-indexed scatter-gather exercises that I did where the readmes contained a lot of this information built in.
Right? Try that because then...

**Wesley Donaldson | 16:32**
Then entering Pacif.

**Sam Hatoum | 16:33**
Then it's very specific. My idea to MD is to keep it as small as possible, really small so that you can have the ability to manage context in other ways. You don't want to pollute it with too much because it takes it off piece, but just letting it know you have a place to go.
Look at these files or index, that's probably enough, right? Couple that with the memory that we mentioned and that's it. Just keep it super light. It should be able to figure everything else out just by doing GPS and the things that Claude does.

**Wesley Donaldson | 16:56**
To...

**Sam Hatoum | 16:59**
The only thing you want to have extra in there is just things that are not obvious, right?
It's not going to go look and read me unless you've told it. So just like that's really what it is. Do scatter-gather, tell it to go look at the readmes, and then govern. Okay, so you haven't gotten into the event sourcing world yet. When you do, please contact me. I'd love to pair with you on some of that, especially the stuff I really want to make sure everyone's got a structured way of doing things.

**Wesley Donaldson | 17:25**
I grow.

**Sam Hatoum | 17:28**
If you want a reactor, if you want a React or something, we're a reactor. If you want to ingest new events, we do a decider. If you want to do a data, we do a projector. So I just want people to know these are all the three patterns that we use and it's just three patterns.

**Wesley Donaldson | 17:36**
So I want to know and I...

**Sam Hatoum | 17:40**
For people to be really adept at those patterns. And then we can really make everyone quick with event sourcing. That's my goal right now. I don't want to hear event sourcing is too complex and it's bringing us down. I want to hear, "Holy shit, event sourcing is all we've done any other way."
Because I know that's what people will believe once they know it, but it's just going to take some coaching to get to that point.

**Wesley Donaldson | 17:55**
I know more people will say they help, but you can take some adation if nothing.

**jeremy.campeau@llsa.com | 18:01**
Sounds good.

**Sam Hatoum | 18:02**
All right, ma'am, cool. Anything else I can help with?

**jeremy.campeau@llsa.com | 18:06**
No, I can definitely start on adding those things and hopefully that'll help me and just help that repo in general. Just get up to date so we can leverage AI better.

**Sam Hatoum | 18:15**
Awesome, man, awesome. All right, thanks a lot. Whereas I've canceled... If you want to cancel it, I've spoken to Antonio already through the various sessions. I don't need to talk to him again. All right, so I'm done.

**Wesley Donaldson | 18:24**
Sounds good.

**jeremy.campeau@llsa.com | 18:24**
Thank you.

**Sam Hatoum | 18:25**
Jas. Thank you both. Bye.

**Wesley Donaldson | 18:27**
Jerry, if you have any issues with setting up Super Whisper, any of those... I use them myself, in my personal capacity.
So if you're having any hard time with them... For me, it was a bitch in the ass to get it to actually inject the content I was talking to it with and for it to understand. But let me know if you're into anything there. I'm not saying I'm like Sam.

**jeremy.campeau@llsa.com | 18:48**
Sounds good.

**Wesley Donaldson | 18:50**
Like I like the light beer version. That doesn't taste as good.

**jeremy.campeau@llsa.com | 18:56**
I'll keep that in mind.
Have a good one.

