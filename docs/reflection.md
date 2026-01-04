# Written Part — FocusFlow

## 1. Introduction

FocusFlow is a web-based focus and task management application developed as part of the Weapon of Math Destruction assignment.
The goal of this project was to collect as many user interactions as possible on an individual level, analyze this data in the backend, and subtly influence user behavior through the user interface.

Rather than focusing on maximizing productivity, this project investigates how easily behavioral data can be interpreted, profiled, and applied to steer users.
Profiling is performed on a session level, allowing behavioral insights to emerge without building a long-term history per user.

## 2. Outcomes

### 2.1 Data Collection

During a user session, FocusFlow collects a wide range of interaction data.
This includes the use of the focus timer, creating, editing, and completing tasks, navigation between pages, tab activity (focus and blur), idle behavior, and basic device and browser information.

Each session is assigned a unique identifier, allowing behavior to be analyzed per user and per session without relying entirely on account-based data.

### 2.2 Profiling and Analysis

All collected events are persistently stored in a PostgreSQL database and processed in the backend.
Raw events are first aggregated into measurable metrics, which are then translated into scores such as focus, engagement, decisiveness, and procrastination.

Based on predefined thresholds, these scores result in behavioral labels such as Focused, Distracted, Low Engagement, or Procrastinator.
These labels function as summaries of the observed behavior within a single session.

### 2.3 Influence on the User Interface

The user-facing interface is subtly adapted based on the dominant behavioral label of the session.
Instead of blocking or forcing users, small nudges are applied, such as contextual tips, adjusted visual emphasis on buttons, and slight variations in color usage.

This influence is intentionally limited, ensuring that users always remain in control of their actions.

## 3. Shortcomings and Pitfalls

### 3.1 Data Accuracy

The collected data is inherently imprecise.
Idle detection may incorrectly interpret a user as disengaged while they are in fact reading or thinking.
Similarly, tab activity provides little insight into actual cognitive attention, and device or browser detection is limited to what the client environment exposes

### 3.2 Interpretation and Bias

Profiling within FocusFlow is based on assumptions and threshold values defined by the developer.
Determining these values proved particularly difficult, especially because the underlying data itself is uncertain and incomplete.

For example, idle detection may falsely indicate disengagement even when a user is highly focused.
When such signals are already unreliable, applying fair and meaningful thresholds and scoring mechanisms becomes problematic.

As a result, the chosen thresholds and score calculations are not objective truths, but outcomes of interpretation, estimation, and experimentation by the developer.
In short sessions or sessions with few events, scores may fluctuate significantly, increasing the risk of incorrect or misleading labels.

The assigned labels should therefore not be regarded as accurate representations of user behavior, but rather as fragile constructs based on assumptions.

### 3.3 Ethical Considerations

The project demonstrates how easily behavioral data can be used to influence users.
Even subtle nudges may unintentionally apply pressure or favor specific behaviors.

This highlights the risk of reducing complex human behavior to simplified scores and labels, which represents a core issue within the concept of weapons of math destruction.

## 4. Insights and Reflection

Developing FocusFlow revealed how difficult it is to correctly interpret and weigh collected behavioral data.
While gathering large amounts of data is technically straightforward, determining what that data actually means is far more complex.

Many conclusions drawn from the data are based on assumptions devised by the developer.
There is no objective measure to determine whether a user is truly focused, distracted, or indecisive, making profiling inevitably shaped by subjective choices.

Additionally, the user has no insight into or control over how their data is interpreted.
While users generate the behavior, they have no influence over the rules, thresholds, or labels applied to it.

This project made clear how quickly uncertainties accumulate in data-driven systems, and how easily these uncertainties can be obscured by numbers, scores, and labels that appear objective but are not.

## 5. Conclusion

FocusFlow successfully demonstrates a complete pipeline of data collection, profiling, and subtle user influence.
At the same time, the project shows how fragile and interpretation-sensitive such systems are.

Although the collected data appears quantitative and objective, its meaning is largely determined by assumptions, thresholds, and interpretations defined by the developer.
When the reliability of individual signals is already uncertain, applying fair and consistent profiling becomes extremely difficult.

The project therefore highlights a core issue of weapons of math destruction: systems built on uncertain data and subjective assumptions can still appear highly convincing and authoritative.
Users are influenced by decisions and labels over which they have no visibility or control.

Rather than presenting profiling as a neutral or definitive solution, FocusFlow demonstrates that such systems must be applied with great care, transparency, and critical reflection.
