Feature: Song creation

  Scenario: Create a new song
    Given I am inside a band dashboard
    When I click on "Create Song"
    And I enter the title "New Track"
    And I set BPM to "120"
    And I click "Save"
    Then the song is created
    And I see it in the songs list