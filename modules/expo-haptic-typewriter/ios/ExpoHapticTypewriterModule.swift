import ExpoModulesCore
import CoreHaptics

public class ExpoHapticTypewriterModule: Module {
  private var hapticEngine: CHHapticEngine?
  private var player: CHHapticAdvancedPatternPlayer?
  
  public func definition() -> ModuleDefinition {
    Name("ExpoHapticTypewriter")
    
    OnCreate {
      setupHapticEngine()
    }
    
    OnDestroy {
      stopHaptics()
      hapticEngine = nil
    }
    
    // Start continuous haptic pattern for typewriter effect
    AsyncFunction("startTypewriterHaptics") { (characterCount: Int, speed: Double) in
      try await startTypewriterPattern(characterCount: characterCount, speed: speed)
    }
    
    // Stop haptics
    Function("stopTypewriterHaptics") {
      stopHaptics()
    }
    
    // Single character tick
    Function("tickCharacter") {
      tickCharacter()
    }
  }
  
  private func setupHapticEngine() {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      return
    }
    
    do {
      hapticEngine = try CHHapticEngine()
      try hapticEngine?.start()
      
      // Handle engine reset
      hapticEngine?.resetHandler = { [weak self] in
        do {
          try self?.hapticEngine?.start()
        } catch {
          print("Failed to restart haptic engine: \(error)")
        }
      }
    } catch {
      print("Failed to create haptic engine: \(error)")
    }
  }
  
  private func startTypewriterPattern(characterCount: Int, speed: Double) async throws {
    guard let engine = hapticEngine else { return }
    
    // Create haptic events for each character
    var events: [CHHapticEvent] = []
    var parameters: [CHHapticDynamicParameter] = []
    
    for i in 0..<characterCount {
      let time = Double(i) * speed / 1000.0 // Convert ms to seconds
      
      // Sharp, crisp tap for each character
      let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.8)
      let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.9)
      
      let event = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [intensity, sharpness],
        relativeTime: time
      )
      
      events.append(event)
    }
    
    do {
      let pattern = try CHHapticPattern(events: events, parameters: [])
      player = try engine.makeAdvancedPlayer(with: pattern)
      
      try player?.start(atTime: CHHapticTimeImmediate)
    } catch {
      print("Failed to play haptic pattern: \(error)")
    }
  }
  
  private func tickCharacter() {
    guard let engine = hapticEngine else { return }
    
    do {
      // Ultra-light, crisp tick
      let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6)
      let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 1.0)
      
      let event = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [intensity, sharpness],
        relativeTime: 0
      )
      
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      let player = try engine.makePlayer(with: pattern)
      
      try player.start(atTime: CHHapticTimeImmediate)
    } catch {
      print("Failed to play tick: \(error)")
    }
  }
  
  private func stopHaptics() {
    do {
      try player?.stop(atTime: CHHapticTimeImmediate)
      player = nil
    } catch {
      print("Failed to stop haptics: \(error)")
    }
  }
}
